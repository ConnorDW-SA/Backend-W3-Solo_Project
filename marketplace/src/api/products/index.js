import express from "express";
import createHttpError from "http-errors";
import productModel from "./model.js";
import q2m from "query-to-mongo";

const productsRouter = express.Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);

    const total = await productModel.countDocuments(mongoQuery.criteria);
    const products = await productModel
      .find(mongoQuery.criteria, mongoQuery.options.fields)
      .skip(mongoQuery.options.skip)
      .limit(mongoQuery.options.limit)
      .sort(mongoQuery.options.sort);
    res.send({
      links: mongoQuery.links("http://localhost:3001/products", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      products
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/filter", async (req, res, next) => {
  try {
    const category = req.query.category;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    let query = {};
    if (category) {
      query.category = category;
    }
    if (minPrice && maxPrice) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice) {
      query.price = { $gte: minPrice };
    } else if (maxPrice) {
      query.price = { $lte: maxPrice };
    }

    const products = await productModel.find(query);
    res.send(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (product) {
      res.send(product);
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new productModel(req.body);
    const { _id } = await newProduct.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const product = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true
      }
    );
    if (product) {
      res.send(product);
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);
    if (product) {
      res.status(204).send();
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

//------------------------REVIEWS------------------------//

productsRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (product) {
      res.send(product.reviews);
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.post("/:id/reviews", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (product) {
      const newReview = await productModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: { reviews: req.body }
        },
        { runValidators: true, new: true }
      );
      res.send(newReview);
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (product) {
      const review = product.reviews.find(
        (r) => r._id.toString() === req.params.reviewId
      );
      if (review) {
        review.comment = req.body.comment;
        review.rate = req.body.rate;
        const updatedProduct = await product.save();
        res.send(updatedProduct);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (product) {
      const review = product.reviews.find(
        (r) => r._id.toString() === req.params.reviewId
      );
      if (review) {
        const updatedProduct = await productModel.findByIdAndUpdate(
          req.params.id,
          {
            $pull: { reviews: { _id: req.params.reviewId } }
          },
          { runValidators: true, new: true }
        );
        res.send(updatedProduct);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      next(createHttpError(404, `Product with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
