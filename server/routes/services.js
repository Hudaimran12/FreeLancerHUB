// routes/services.js
// This file defines all the URL routes and connects them to controller functions

const express = require("express");
const router = express.Router(); // create a mini-app (router)

// Import all controller functions
const {
  getAllServices,
  getServiceById,
  addService,
  saveService,
  hireService,
  getSavedServices,
  getHiredServices,
} = require("../controllers/servicesController");

// ── Service routes ────────────────────────────────────────────────────────────
router.get("/services", getAllServices);         // GET all services
router.get("/services/:id", getServiceById);    // GET one service by id
router.post("/services", addService);           // POST add new service (bonus)

// ── Save / Hire routes ────────────────────────────────────────────────────────
router.post("/save", saveService);              // POST save a service
router.post("/hire", hireService);              // POST hire a service
router.get("/saved", getSavedServices);         // GET all saved services
router.get("/hired", getHiredServices);         // GET all hired services

module.exports = router;
