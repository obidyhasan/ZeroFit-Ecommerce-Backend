import { Product } from "./../product/product.model";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { IOrder, IOrderLog, ORDER_STATUS } from "./order.interface";
import { Order } from "./order.model";
import AppError from "../../errors/AppError";
import { Role } from "../user/user.interface";
import { getTrackingId } from "../../utils/getTrackingId";
import { User } from "../user/user.model";
import { Cart } from "../cart/cart.model";

const createOrder = async (
  decodedToken: JwtPayload,
  payload: Partial<IOrder>
) => {
  const isUserExits = await User.findById(decodedToken.userId);
  if (!isUserExits)
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exits!");

  const isCartsExits = await Cart.find({ _id: { $in: payload.carts } });
  if (isCartsExits.length !== payload.carts?.length)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "One or more carts do not exits!"
    );

  const totalAmount = isCartsExits.reduce((sum, cart) => sum + cart.amount, 0);

  for (const cart of isCartsExits) {
    const isProductExits = await Product.findById(cart.product);
    if (!isProductExits)
      throw new AppError(httpStatus.NOT_FOUND, "Product not found!");

    if (isProductExits.quantity < cart.quantity)
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Not enough stock for product: ${isProductExits._id}`
      );

    isProductExits.quantity -= cart.quantity;
    await isProductExits.save();
  }

  const orderLog: IOrderLog = {
    status: ORDER_STATUS.Pending,
    timestamp: new Date(),
    updateBy: decodedToken.userId,
    note: "Order request successfully. Current status is Pending.",
  };

  payload.trackingId = getTrackingId();
  payload.statusLogs = [orderLog];
  payload.totalAmount = totalAmount;

  const order = await Order.create({ ...payload, user: decodedToken.userId });

  isUserExits.orders?.push(order._id);
  await isUserExits.save();

  return order;
};

const getAllOrders = async () => {
  const orders = await Order.find({})
    .populate("user", "name email carts orders")
    .populate("carts");
  const totalOrders = await Order.countDocuments();

  return {
    data: orders,
    meta: {
      total: totalOrders,
    },
  };
};

const getMyOrders = async (decodedToken: JwtPayload) => {
  const isUserExits = await User.findById(decodedToken.userId);
  if (!isUserExits)
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exits!");

  const orders = await Order.find({ user: decodedToken.userId });
  const totalOrders = await Order.countDocuments();

  return {
    data: orders,
    meta: {
      total: totalOrders,
    },
  };
};

const updateOrder = async (
  orderId: string,
  payload: Partial<IOrder>,
  decodedToken: JwtPayload
) => {
  const isOrderExits = await Order.findById(orderId);
  if (!isOrderExits)
    throw new AppError(httpStatus.NOT_FOUND, "Order does not exits!");

  const isUserExits = await User.findById(isOrderExits.user);
  if (!isUserExits)
    throw new AppError(httpStatus.NOT_FOUND, "User does not exits!");

  if (
    isUserExits._id.toString() !== decodedToken.userId &&
    decodedToken.role === Role.USER
  )
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");

  if (isOrderExits.status === ORDER_STATUS.Cancelled) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can't update status ${payload.status}. Because order current status is ${isOrderExits.status}`
    );
  }

  if (payload.status === ORDER_STATUS.Pending) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can't update status ${payload.status}. Because order current status is ${isOrderExits.status}`
    );
  }
  if (payload.status === ORDER_STATUS.Delivered) {
    if (decodedToken.role !== Role.USER) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        `You can't update status ${payload.status}. Because you are not authorized!`
      );
    }
  }

  if (
    payload.status === ORDER_STATUS.Confirm ||
    payload.status === ORDER_STATUS.Picked ||
    payload.status === ORDER_STATUS.InTransit
  ) {
    if (
      decodedToken.role !== Role.SUPER_ADMIN &&
      decodedToken.role !== Role.ADMIN
    ) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        `You can't update status ${payload.status}. Because you are not authorized!`
      );
    }
  }

  if (
    payload.status === ORDER_STATUS.Delivered &&
    decodedToken.role === Role.USER
  ) {
    if (isOrderExits.status !== ORDER_STATUS.InTransit) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `You can't update status ${payload.status}. Because order current status is ${isOrderExits.status}`
      );
    }
  }

  if (payload.status === ORDER_STATUS.Confirm) {
    if (isOrderExits.status !== ORDER_STATUS.Pending) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `You can't update status ${payload.status}. Because order current status is ${isOrderExits.status}`
      );
    }
  }

  if (payload.status === ORDER_STATUS.Picked) {
    if (isOrderExits.status !== ORDER_STATUS.Confirm) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `You can't update status ${payload.status}. Because order current status is ${isOrderExits.status}`
      );
    }
  }

  if (payload.status === ORDER_STATUS.InTransit) {
    if (isOrderExits.status !== ORDER_STATUS.Picked) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `You can't update status ${payload.status}.Because order current status is ${isOrderExits.status}`
      );
    }
  }

  if (payload.status === ORDER_STATUS.Cancelled) {
    if (isOrderExits.status === ORDER_STATUS.Delivered) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `You can't update status ${payload.status}.Because order current status is ${isOrderExits.status}`
      );
    }
  }

  const orderLog: IOrderLog = {
    status: payload.status as ORDER_STATUS,
    timestamp: new Date(),
    updateBy: decodedToken.userId,
    note: `Order request successfully. Current status is ${payload.status}.`,
  };

  const updateParcelLog = [
    ...(isOrderExits.statusLogs as IOrderLog[]),
    orderLog,
  ];

  payload.statusLogs = updateParcelLog;

  const updateOrder = await Order.findByIdAndUpdate(orderId, payload, {
    new: true,
    runValidators: true,
  });

  return updateOrder;
};

const deleteOrder = async (orderId: string, decodedToken: JwtPayload) => {
  const isOrderExits = await Order.findById(orderId);
  if (!isOrderExits)
    throw new AppError(httpStatus.NOT_FOUND, "Order does not exits!");

  const isUserExits = await User.findById(decodedToken.userId);
  if (!isUserExits)
    throw new AppError(httpStatus.NOT_FOUND, "User does not exits");

  await Order.findByIdAndDelete(orderId);

  isUserExits.orders = isUserExits.orders?.filter(
    (cartItem) => cartItem.toString() !== orderId
  );
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrder,
  deleteOrder,
};
