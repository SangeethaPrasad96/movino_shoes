const Product = require("../../models/productSchema");
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');



// 1. GET all products

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const searchQuery = req.query.search || '';

    const query = {
      isDeleted: false,
      name: { $regex: searchQuery, $options: 'i' }
    };

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
    .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.render('products/productList', {
      products,
      totalPages,
      currentPage: page,
      searchQuery,
      limit
    });

  } catch (err) {
    console.log(err);
    res.redirect("/admin/pageerror");
  }
};

// 2. GET add product form
const getAddProductForm = (req, res) => {
  res.render('products/addProduct');
};

// 3. POST add new product



const postAddProduct = async (req, res) => {
  try {
    const { name, category, subcategory, price,description,stock } = req.body;
//already existing
    const existing = await Product.findOne({ name: name.trim() });
    if (existing) {
      return res.redirect('/admin/products/add?exists=true');
    }
    // Check if at least 3 images are uploaded
    if (!req.files || req.files.length < 3) {
      // You can pass a query parameter to trigger SweetAlert on frontend
      return res.redirect('/admin/products/add?error=minimumImages');
    }

    // const images = req.files.map(file => file.filename);
    const images = req.body.images;

    const newProduct = new Product({
      name,
      category,
      subcategory,
      price,
      images,
      description,
      stock,
    });

    await newProduct.save();

    // Pass success message via query string
    res.redirect('/admin/products?added=success');
  } catch (error) {
    console.error('Error adding product:', error);
    res.redirect('/admin/products/add?error=server');
  }
};


// 4. GET edit product form

const editProductForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');

      // 👉 Pass error and exists flags to EJS
      res.render('products/editProduct', {
        product,
        error: req.query.error,
        exists: req.query.exists
      });
    // res.render('products/editProduct', { product });
  } catch (error) {
    console.error('Error fetching product for edit:', error);
    res.status(500).send('Server Error');
  }
};

// // 5. POST update product
// const updateProduct = async (req, res) => {
//   try {
//     const { name, description, price } = req.body;
//     const images = req.files.map(file => file.filename);

//     const updateData = {
//       name,
//       description,
//       price,
//     };

//     if (images.length > 0) {
//       updateData.images = images;
//     }

//     await Product.findByIdAndUpdate(req.params.id, updateData);
//     req.flash('success', 'Product updated successfully!');
//     res.redirect('/admin/products');
//   } catch (error) {
//     console.error('Error updating product:', error);
//     req.flash('error', 'Failed to update product.');
//     res.redirect(`/admin/products/edit/${req.params.id}`);
//   }
// };

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, category, subcategory, price, description, stock } = req.body;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      console.log('No product found with ID:', productId);
      return res.status(404).send("Product not found");
    }

    const nameExists = await Product.findOne({ name: name.trim(), _id: { $ne: productId } });
    if (nameExists) {
      return res.redirect(`/admin/products/edit/${productId}?exists=true`);
    }

    const updatedFields = {
      name: name || existingProduct.name,
      category: category || existingProduct.category,
      subcategory: subcategory || existingProduct.subcategory,
      price: price || existingProduct.price,
      description: description || existingProduct.description,
      stock: stock || existingProduct.stock,
    };

    if (req.files && req.files.length > 0) {
      if (req.files.length < 3) {
        return res.redirect(`/admin/products/edit/${productId}?error=minImages`);
      }

      if (existingProduct.images && existingProduct.images.length > 0) {
        existingProduct.images.forEach(img => {
          const imgPath = path.join(__dirname, "../../public/uploads", img);
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });
      }

      const newImages = req.files.map(file => file.filename); // ✅ FIXED
      updatedFields.images = newImages;
    }

    await Product.findByIdAndUpdate(productId, updatedFields, { new: true });

    res.redirect('/admin/products?updated=success');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Internal Server Error');
  }
};



const softDeleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    await Product.findByIdAndUpdate(productId, { isDeleted: true });

    res.redirect('/admin/products'); // reloads page and product will disappear
  } catch (error) {
    console.log('Error deleting product:', error);
    res.status(500).send('Internal Server Error');
  }
};


// 7. GET deleted products
const viewDeletedProducts = async (req, res) => {
  try {
    const deletedProducts = await Product.find({ isDeleted: true });
   
    res.render('products/deletedProduct', { deletedProducts });
  } catch (error) {
    console.error('Error fetching deleted products:', error);
    res.status(500).send('Server Error');
  }
};

// 8. GET recover soft-deleted product

const recoverProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    await Product.findByIdAndUpdate(productId, { isDeleted: false });

    res.redirect('/admin/products/deleted'); // or wherever you want to redirect
  } catch (error) {
    console.log('Error recovering product:', error);
    res.status(500).send('Internal Server Error');
  }
};



//search option with reset

const searchProducts = async (req, res) => {
  const query = req.query.query || '';  // Default to an empty string if no query is passed
  
  try {
      // Call the search method from the Product model
      const products = await Product.searchProducts(query);

      // Render the 'products' view with products and query
      res.render('shop', {
          products: products,
          query: query
      });
  } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
  }
};




   

// Exporting all functions
module.exports = {
  getAllProducts,
  getAddProductForm,
  postAddProduct,
  editProductForm,
  updateProduct,
  softDeleteProduct,
  viewDeletedProducts,
  recoverProduct,
  searchProducts,
  
};




