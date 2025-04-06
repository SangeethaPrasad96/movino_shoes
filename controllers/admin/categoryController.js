const Category = require("../../models/categorySchema");

// List with Search + Pagination
const getCategories = async (req, res) => {
  const search = req.query.search || "";
  const page = parseInt(req.query.page) || 1;
  const limit = 5;

  const query = {
    isDeleted: false,
    $or: [
      { categoryName: { $regex: search, $options: "i" } },
      { subCategory: { $regex: search, $options: "i" } },
    ],
  };

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.render("category", {
    categories,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    search,
    limit,
  });
};

const addCategoryPage = (req, res) => {
  res.render("addCategory");
};

const addCategory = async (req, res) => {
  const { categoryName, subCategory } = req.body;
  const image = req.file ? req.file.filename : null;

  await Category.create({ categoryName, subCategory, image });
  res.redirect("/admin/categories");
};

const editCategoryPage = async (req, res) => {
  const category = await Category.findById(req.params.id);
  res.render("editCategory", { category });
};

const editCategory = async (req, res) => {
  const { categoryName, subCategory } = req.body;
  const image = req.file ? req.file.filename : undefined;

  const updateData = { categoryName, subCategory };
  if (image) updateData.image = image;

  await Category.findByIdAndUpdate(req.params.id, updateData);
  res.redirect("/admin/categories");
};

const softDeleteCategory = async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isDeleted: true });
  res.json({ success: true });
};

const recoveryPage = async (req, res) => {
  const deletedCategories = await Category.find({ isDeleted: true });
  res.render("recovery", { deletedCategories });
};

// Add if you want recover functionality too
const recoverCategory = async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isDeleted: false });
  res.redirect("/admin/categories");
};

module.exports = {
  getCategories,
  addCategoryPage,
  addCategory,
  editCategoryPage,
  editCategory,
  softDeleteCategory,
  recoveryPage,
  recoverCategory, // optional if needed
};
