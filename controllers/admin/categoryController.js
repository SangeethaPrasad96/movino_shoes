const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");


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


// GET: Render Add Category Page
const addCategoryPage = (req, res) => {
  res.render("addCategory", {
    successMessage: req.flash("successMessage"),
    errorMessage: req.flash("errorMessage")
  });
};

// POST: Add Category
const addCategory = async (req, res) => {
  try {
    const { categoryName, subCategory } = req.body;
    const image = req.file ? req.file.filename : null;

    await Category.create({ categoryName, subCategory, image });

    req.flash('successMessage', 'Category added successfully!');
    res.redirect("/admin/categories"); // redirect back to form if you want to show alert here
  } catch (error) {
    console.error("Error adding category:", error);
    req.flash('errorMessage', 'Something went wrong!');
    res.redirect("/admin/categories/add");
  }
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
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });

    if (category) {
      // Also mark all products under this category as deleted
      await Product.updateMany(
        { category: category._id  },
       
        { $set: { isDeleted: true } }
     
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error in soft deleting category and its products:", err);
    res.json({ success: false, message: "Error deleting category" });
  }
};






const recoveryPage = async (req, res) => {
  const deletedCategories = await Category.find({ isDeleted: true });
  res.render("recovery", { deletedCategories });
};


const recoverCategory = async (req, res) => {
  try {

    // console.log("recoverCategory function called with ID:", req.params.id);
    // Recover the category
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true } // Return the updated document
    );

    if (!category) {
      console.error("Category not found for recovery:", req.params.id);
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Debug: Log the recovered category name
    console.log("Recovered category name:", category._id);

    // Recover all related products (case-insensitive match)
    const updatedProductsResult = await Product.updateMany(
      { category: { $regex: new RegExp(`^${category._id}$`, "i") } }, // Case-insensitive match
      { $set: { isDeleted: false } }
    );

    // Debug: Log the number of updated products
    console.log(
      `Products updated for category (${category._id}):`,
      updatedProductsResult.modifiedCount
    );

    // Redirect back to admin categories
    res.redirect("/admin/categories");
  } catch (err) {
    console.error("Error recovering category and its products:", err);
    res.status(500).json({ success: false, message: "Error recovering category" });
  }
};




// Block Category
const blockCategory = async (req, res) => {
  try {
    const category = req.params.id;
   
    await Category.findByIdAndUpdate(category, { isBlocked: true });
    res.redirect('/admin/categories');
  } catch (err) {
    console.error('Error blocking category:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Unblock Category
const unblockCategory = async (req, res) => {
  try {
    const category = req.params.id;

    await Category.findByIdAndUpdate(category, { isBlocked: false });
    res.redirect('/admin/categories');
  } catch (err) {
    console.error('Error unblocking category:', err);
    res.status(500).send('Internal Server Error');
  }
};



module.exports = {
  getCategories,
  addCategoryPage,
  addCategory,
  editCategoryPage,
  editCategory,
  softDeleteCategory,
  recoveryPage,
  recoverCategory,
  blockCategory,
  unblockCategory,


};
