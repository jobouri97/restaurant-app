import {
  createRequest,
  findRequestById,
  findRequestByTrackingToken,
  findRequestsByUserId,
  REQUEST_STATUSES,
  updateRequestStatus,
} from "../models/requestModel.js";
import {
  emitRequestCreated,
  emitRequestUpdated,
} from "../src/socket.js";

const parseId = (value) =>
  typeof value === "string" && /^\d+$/.test(value) ? value : null;

const normalizeCreateInput = (body = {}) => {
  if (!Array.isArray(body.items)) return null;

  return body.items.map((item) => ({
    itemId: parseId(String(item?.itemId ?? "")),
    qty: Number(item?.qty),
    ingredients: Array.isArray(item?.ingredients)
      ? item.ingredients.map((selection) => ({
        ingredientId: parseId(String(selection?.ingredientId ?? "")),
        optionId: parseId(String(selection?.optionId ?? "")),
      }))
      : [],
  }));
};

const validateCreateInput = (items) => {
  if (!items || items.length === 0) return "At least one item is required";
  if (items.length > 100) return "A request can contain at most 100 lines";

  for (const item of items) {
    if (!item.itemId) return "Every item must have a valid itemId";
    if (!Number.isSafeInteger(item.qty) || item.qty < 1 || item.qty > 100) {
      return "Every item quantity must be an integer between 1 and 100";
    }
    if (
      item.ingredients.some(
        (selection) => !selection.ingredientId || !selection.optionId,
      )
    ) {
      return "Every ingredient choice needs valid ingredientId and optionId";
    }
  }
  return null;
};

export const addPublicRequest = async (req, res, next) => {
  try {
    const items = normalizeCreateInput(req.body);
    const validationError = validateCreateInput(items);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const request = await createRequest({
      qrCode: req.params.qrCode,
      items,
    });
    emitRequestCreated(request);
    return res.status(201).json({
      message: "Request created",
      request,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getPublicRequest = async (req, res, next) => {
  try {
    const trackingToken = req.params.trackingToken;
    if (!/^[A-Za-z0-9_-]{20,64}$/.test(trackingToken)) {
      return res.status(400).json({ message: "Invalid tracking token" });
    }

    const request = await findRequestByTrackingToken(trackingToken);
    if (!request) return res.status(404).json({ message: "Request not found" });
    return res.json({ request });
  } catch (error) {
    next(error);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const status = req.query.status || null;
    if (status && !REQUEST_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid request status" });
    }

    const requests = await findRequestsByUserId(req.auth.userId, status);
    return res.json({ requests });
  } catch (error) {
    next(error);
  }
};

export const getRequest = async (req, res, next) => {
  try {
    const requestId = parseId(req.params.id);
    if (!requestId) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const request = await findRequestById(requestId, req.auth.userId);
    if (!request) return res.status(404).json({ message: "Request not found" });
    return res.json({ request });
  } catch (error) {
    next(error);
  }
};

export const changeRequestStatus = async (req, res, next) => {
  try {
    const requestId = parseId(req.params.id);
    if (!requestId) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    const status =
      typeof req.body.status === "string" ? req.body.status.trim() : "";
    if (!REQUEST_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid request status" });
    }

    const request = await updateRequestStatus({
      requestId,
      userId: req.auth.userId,
      status,
    });
    if (!request) return res.status(404).json({ message: "Request not found" });
    emitRequestUpdated(request);
    return res.json({ message: "Request status updated", request });
  } catch (error) {
    next(error);
  }
};
