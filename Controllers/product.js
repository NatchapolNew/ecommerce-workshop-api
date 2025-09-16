const { query } = require("express");
const prisma = require("../Config/prisma");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  // Configuration
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

exports.create = async (req, res) => {
  try {
    //code
    const { title, description, price, quantity, images, categoryId } =
      req.body;
    const product = await prisma.product.create({
      data: {
        //ฝั่งซ้ายฟิลในฐานข้อมูล ฝั่งขวาส่งมาจากfrontend
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        //wait return ออกไปเป็นObject
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });

    res.send(product);
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ messgae: "Server Error" });
  }
};

exports.list = async (req, res) => {
  try {
    //code
    const { count } = req.params;
    const products = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: { createdAt: "desc" }, //เรียงจากมากไปน้อย
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ messgae: "Server Error" });
  }
};

exports.read = async (req, res) => {
  try {
    //code
    const { id } = req.params;
    const products = await prisma.product.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ messgae: "Server Error" });
  }
};

exports.remove = async (req, res) => {
  try {
    //code
    const { id } = req.params;

    //step1 ค้นหาสินค้า include images
    const product = await prisma.product.findFirst({
      where: { id: Number(id) },
      include: { images: true },
    });

    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    console.log(product);

    //step2 Promise ลบรูปภาพในcloudลบแบบรอ
    const deletedImage = product.images.map(
      (image) =>
        new Promise((resolve, reject) => {
          //ลบจากcloud
          cloudinary.uploader.destroy(image.public_id, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        })
    );
    await Promise.all(deletedImage);
    //step3 ลบสินค้า
    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });

    res.send("Deleted Success");
  } catch {
    //err
    console.log(err);
    res.status(500).json({ messgae: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    //code
    const { title, description, price, quantity, images, categoryId } =
      req.body;

    //clear images
    await prisma.image.deleteMany({
      where: {
        productId: Number(req.params.id),
      },
    });

    const product = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        //ฝั่งซ้ายฟิลในฐานข้อมูล ฝั่งขวาส่งมาจากfrontend
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        //wait return ออกไปเป็นObject
        images: {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.send(product);
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ messgae: "Server Error" });
  }
};

exports.listby = async (req, res) => {
  try {
    //code
    const { sort, order, limit } = req.body;
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { [sort]: order },
      include: {
        category: true,
        images: true,
      },
    });

    res.send(products);
  } catch {
    //err
    console.log(err);
    res.status(500).json({ messgae: "Server Error" });
  }
};

const handleQuery = async (req, res, query) => {
  try {
    //code
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    //err
    console.log(err);
    res.status(500).send("Search error");
  }
};

const handlePrice = async (req, res, priceRange) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        price: {
          gte: priceRange[0], //มากกว่า
          lte: priceRange[1], //น้อยกว่า
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Search Error" });
  }
};

//ยอดรวมขายแต่ละประเภท
exports.soldByCategory = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        categoryId: true,
        sold: true,
        price: true,
        category: { select: { name: true } },
      },
    });

    const groupedData = products.reduce((acc, products) => {
      const { sold, price, categoryId } = products; //ทำการdestructuring products
      const categoryName = products.category.name; //ประกาศค่าตัวแปรจากobject category.name

      //เช็คค่าถ้าไม่มีacc[categoryId] = 0 ให้สร้างobjectขึ้นมาใหม่
      if (!acc[categoryId]) {
        acc[categoryId] = { categoryId, categoryName, sold: 0, total: 0 }; //
      }

      acc[categoryId].total += (sold || 0) * (price || 0);
      acc[categoryId].sold += sold || 0;

      return acc;
    }, {});

    //แปลงobjectให้เป็นarrayแล้วresponseไป
    const result = Object.values(groupedData).map((item) => ({
      categoryid: item.categoryId,
      categoryName: item.categoryName,
      sold: item.sold,
      price: item.price,
      total: item.total,
    }));

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ยอดรวมขายทั้งหมด
exports.soldTotal = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        sold: true,
        price: true,
      },
    });

    const Total = products.reduce((acc, product) => {
      acc.soldtotal += product.sold || 0;
      acc.totalrevenue += (product.sold || 0) * (product.price || 0);

      return acc;
    }, {soldtotal:0,totalrevenue:0});

    res.send(Total);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const handleCategory = async (req, res, categoryId) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryId.map((id) => Number(id)),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Search Error" });
  }
};

exports.searchFilter = async (req, res) => {
  try {
    //code
    const { query, category, price } = req.body;

    if (query) {
      console.log("query=>", query);
      await handleQuery(req, res, query);
    }
    if (category) {
      console.log("category=>", category);
      await handleCategory(req, res, category);
    }
    if (price) {
      console.log("price=>", price);
      await handlePrice(req, res, price);
    }
  } catch {
    //err
    console.log(err);
    res.status(500).json({ messgae: "Server Error" });
  }
};

exports.createImages = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `Natchapol-${Date.now()}`,
      resource_type: "auto",
      folder: "Ecom2024",
    });

    res.send(result);
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    cloudinary.uploader.destroy(public_id, (result) => {
      res.send("Remove Image Success!!");
    });
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
