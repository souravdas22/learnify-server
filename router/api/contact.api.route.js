const express = require("express");
const contactApiController = require("../../app/webservice/ContactApiController");
const { AuthCheck } = require("../../app/middleware/authHelper");
const contactRouter = express.Router();

contactRouter.post(
  "/api/contact/create",
  AuthCheck,
  contactApiController.createContact
);
contactRouter.get("/api/contacts", AuthCheck, contactApiController.getContacts);


module.exports = (app) => {
  app.use(contactRouter);
};
