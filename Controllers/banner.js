const { query } = require("express");
const prisma = require("../Config/prisma");
const cloudinary = require("cloudinary").v2;

exports.createBanner = async (req, res) => {
  try {
    //code
    const { url, ImgBanner } = req.body;
    const banner = await prisma.banner.create({
      data: {
        url: url,
        ImgBanner: {
          create: ImgBanner.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.send(banner);
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.listBanner = async (req, res) => {
  try {
    const banner = await prisma.banner.findMany({
      select: {
        id:true,
        url: true,
        ImgBanner: true,
      },
    });
    res.send(banner);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.readBanner = async (req, res) => {
  try {
    //code
    const { id } = req.params;
    const banner = await prisma.banner.findFirst({
      where: {
        id: Number(id),
      },
      include: {
       ImgBanner:[]
      },
    });
    res.send(banner);
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ messgae: "Server Error" });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    //code
    const { url, ImgBanner } = req.body;

    //clear images
    await prisma.imgBanner.deleteMany({
      where: {
        bannerId: Number(req.params.id),
      },
    });

    const banner = await prisma.banner.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        url: url,
        ImgBanner: {
          create: ImgBanner.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        },
      },
    });
    res.json(banner);
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    //code
    const { id } = req.params;

    const Banner = await prisma.banner.findFirst({
      where: { id: Number(id) },
      include: { ImgBanner: true },
    });
    if (!Banner) {
      return res.status(400).json({ message: "Banner not found" });
    }
    console.log(Banner);

    const deletedImgBanner = Banner.ImgBanner.map(
      (image) =>
        new Promise((resolve, reject) => {
          cloudinary.uploader.destroy(image.public_id, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        })
    );
    await Promise.all(deletedImgBanner);

    await prisma.banner.delete({
      where: {
        id: Number(id),
      },
    });

    res.send("Deleted Success");
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createImagesbanner = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.ImgBanner, {
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

exports.removeImagebanner = async (req, res) => {
  try {
    const { public_id } = req.body;
    cloudinary.uploader.destroy(public_id, (result) => {
      res.send("Remove ImageBanner Success!!");
    });
  } catch (err) {
    //err
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
