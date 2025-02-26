import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js ";
import {ApiResponse}  from "../utils/ApiRespons.js";
import { User } from "../models/user.model.js";
import { contactModel } from "../models/contact.model.js";



const addContact = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name) throw new ApiError(400, "Provide contact name");
    if (!email) throw new ApiError(400, "Provide contact email");
    if (!message) throw new ApiError(400, "Provide contact message");

    const existingContact = await contactModel.findOne({ email });
    if (existingContact) throw new ApiError(400, "Contact already exists");


    const newContact = await contactModel.create({ name, email, message });

    if (!newContact) throw new ApiError(500, "Something went wrong");

    res.status(201).json(new ApiResponse(200, "Contact added successfully"));
});

const getContacts = asyncHandler(async (req, res) => {
  const contacts = await contactModel.find({}).sort({ createdAt: -1 });

  if (!contacts) throw new ApiError(500, "Something went wrong");

  res.status(200).json(new ApiResponse(200, contacts, "Contact added successfully"));
});


const deleteContact = asyncHandler(async (req, res) => {
  const { contactId } = req.body;
  const contact = await contactModel.findByIdAndDelete(contactId);

  if (!contact) throw new ApiError(404, "Contact not found");

  res.status(200).json(new ApiResponse(200, contact, "Contact deleted successfully"));
});

const editContact = asyncHandler(async (req, res) => {
  const { contactId, name, email, message } = req.body;
  const contact = await contactModel.findById(contactId);

  if (!contact) throw new ApiError(404, "Contact not found");

  contact.name = name;
  contact.email = email;
  contact.message = message;
  await contact.save();

  res.status(200).json(new ApiResponse(200, contact, "Contact updated successfully"));
});