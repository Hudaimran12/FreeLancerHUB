
const fs = require("fs");
const path = require("path");

// Load services from JSON file into memory when server starts
let services = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/services.json"), "utf-8")
);


let savedServices = [];
let hiredServices = [];


const getAllServices = (req, res) => {
  try {
    let result = [...services]; // copy the array so we don't modify original

    
    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      result = result.filter((s) =>
        s.title.toLowerCase().includes(search)
      );
    }
    

    if (req.query.category && req.query.category !== "All") {
      result = result.filter((s) => s.category === req.query.category);
    }

   
    if (req.query.sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (req.query.sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (req.query.sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};


const getServiceById = (req, res) => {
  try {
    const id = parseInt(req.params.id); // convert string to number
    const service = services.find((s) => s.id === id);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};


const addService = (req, res) => {
  try {
    const { title, category, price, description, delivery } = req.body;

    
    if (!title || !category || !price || !description || !delivery) {
      return res.status(400).json({
        success: false,
        message: "Please provide: title, category, price, description, delivery",
      });
    }

    
    const newService = {
      id: services.length + 1, 
      title,
      category,
      price: Number(price),
      rating: 5.0,
      reviews: 0,
      seller: "NewUser",
      sellerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${title}`,
      description,
      delivery,
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop",
      tags: [category.toLowerCase()],
      featured: false,
    };

    services.push(newService);
    res.status(201).json({ success: true, message: "Service added!", data: newService });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};


const saveService = (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ success: false, message: "serviceId is required" });
    }

    const service = services.find((s) => s.id === parseInt(serviceId));
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Check if already saved
    const alreadySaved = savedServices.find((s) => s.id === service.id);
    if (alreadySaved) {
      return res.status(409).json({ success: false, message: "Service already saved" });
    }

    savedServices.push({ ...service, savedAt: new Date().toISOString() });
    res.status(200).json({ success: true, message: "Service saved!", data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};


const hireService = (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ success: false, message: "serviceId is required" });
    }

    const service = services.find((s) => s.id === parseInt(serviceId));
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Check if already hired
    const alreadyHired = hiredServices.find((s) => s.id === service.id);
    if (alreadyHired) {
      return res.status(409).json({ success: false, message: "Service already hired" });
    }

    hiredServices.push({ ...service, hiredAt: new Date().toISOString(), status: "In Progress" });
    res.status(200).json({ success: true, message: "Service hired successfully!", data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};


const getSavedServices = (req, res) => {
  try {
    res.status(200).json({ success: true, count: savedServices.length, data: savedServices });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};


const getHiredServices = (req, res) => {
  try {
    res.status(200).json({ success: true, count: hiredServices.length, data: hiredServices });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};


module.exports = {
  getAllServices,
  getServiceById,
  addService,
  saveService,
  hireService,
  getSavedServices,
  getHiredServices,
};
