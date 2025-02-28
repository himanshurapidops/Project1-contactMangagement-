import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js ";
import {ApiResponse}  from "../utils/ApiRespons.js";
import { contactModel } from "../models/contact.model.js";

const addContact = asyncHandler(async (req, res) => {

    const { name, email, phone } = req.body;

    if (!name) throw new ApiError(400, "Provide contact name");
    if (!email) throw new ApiError(400, "Provide contact email");
    if (!phone) throw new ApiError(400, "Provide contact phone");

    const existingContact = await contactModel.findOne({ phone });

    if (existingContact) throw new ApiError(400, "Contact already exists");

    const newContact = await contactModel.create({ name, phone ,createdBy: req.user._id });

    if (!newContact) throw new ApiError(500, "Something went wrong");

    res.status(201).json(new ApiResponse(200, newContact, "Contact added successfully"));
});

const getContacts = asyncHandler(async (_, res) => {

  const contacts = await contactModel.find().populate("createdBy", "_id");

  res.status(200).json(new ApiResponse(200, contacts, "Contacts fetched successfully"));
  
});

const getContact = asyncHandler(async (req, res) => {

  const { contactId } = req.params;

  const contact = await contactModel.findById(contactId).populate("createdBy");

  if (!contact) throw new ApiError(404, "Contact not found"); 

  res.status(200).json(new ApiResponse(200, contact, "Contact fetched successfully"));
});

const deleteContact = asyncHandler(async (req, res) => {

  const { contactId } = req.body;

  const contact = await contactModel.findByIdAndDelete(contactId);

  if (!contact) throw new ApiError(404, "Contact not found");

  res.status(200).json(new ApiResponse(200, contact, "Contact deleted successfully"));
});

const editContact = asyncHandler(async (req, res) => {

  const { contactId } = req.params;

  const { name, email, message } = req.body;

  const contact = await contactModel.findById(contactId);

  if (!contact) throw new ApiError(404, "Contact not found");

  contact.name = name;
  contact.email = email;
  contact.message = message;
  contact.editedBy = req.user._id;

  await contact.save();

  res.status(200).json(new ApiResponse(200, contact, "Contact updated successfully"));
});

export { addContact, getContact, getContacts,deleteContact, editContact };