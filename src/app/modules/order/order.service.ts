/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import { sendEmail } from "../../utils/sendEmail";

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

  const createOrder = await Order.create({
    ...payload,
    user: decodedToken.userId,
  });

  isUserExits.orders?.push(createOrder._id);
  await isUserExits.save();

  // Create Invoice

  const order = await Order.findById(createOrder._id)
    .populate({
      path: "carts",
      populate: {
        path: "product", // Assuming cart.product is ObjectId of Product
        model: "Product",
        select: "name newPrice", // select only needed fields
      },
    })
    .populate("user");

  if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order does not found");

  const user = await User.findById(order.user);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User does not found");

  const invoiceData: IInvoiceData = {
    trackingId: order.trackingId,
    orderDate: order.createdAt,
    userName: user?.name,
    totalAmount: order.totalAmount,
    products: order.carts.map((cart: any) => ({
      name: cart.product.name,
      quantity: cart.quantity,
      price: cart.product.newPrice,
    })),
  };

  const pdfBuffer = await generatePdf(invoiceData);

  const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer, "invoice");

  await Order.findByIdAndUpdate(
    createOrder._id,
    { invoiceUrl: cloudinaryResult?.secure_url },
    { runValidators: true }
  );

  const additionalData = {
    userEmail: user.email,
    invoiceDownloadUrl: cloudinaryResult?.secure_url,
  };

  const templateData = {
    ...invoiceData,
    ...additionalData,
  };

  try {
    await sendEmail({
      to: user.email,
      subject: "Your Order Invoice",
      templateName: "invoice",
      templateData,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  } catch (err) {
    console.error("Failed to send invoice email:", err);
    // Optionally decide if this should throw or be logged silently
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to send email"
    );
  }

  return createOrder;
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

  if (payload.status === ORDER_STATUS.Cancelled) {
    const isCartsExits = await Cart.find({ _id: { $in: isOrderExits.carts } });
    if (isCartsExits.length !== payload.carts?.length)
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "One or more carts do not exits!"
      );

    for (const cart of isCartsExits) {
      const isProductExits = await Product.findById(cart.product);
      if (!isProductExits)
        throw new AppError(httpStatus.NOT_FOUND, "Product not found!");

      if (isProductExits.quantity < cart.quantity)
        throw new AppError(
          httpStatus.NOT_FOUND,
          `Not enough stock for product: ${isProductExits._id}`
        );

      isProductExits.quantity += cart.quantity;
      await isProductExits.save();
    }
  }

  if (payload.paymentStatus && decodedToken.role === Role.USER) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      `You are not authorized for this payment stats update.`
    );
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

const getInvoiceDownloadUrl = async (orderId: string) => {
  const order = await Order.findById(orderId).select("invoiceUrl");

  if (!order) throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  if (!order.invoiceUrl)
    throw new AppError(httpStatus.NOT_FOUND, "No invoice found");

  return order.invoiceUrl;
};

export const OrderService = {
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrder,
  deleteOrder,
  getInvoiceDownloadUrl,
};
