const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  //* Copy req.query
  const reqQuery = { ...req.query };

  // * Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // * Loop over remove fields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // * Create query string
  let queryStr = JSON.stringify(reqQuery);

  // * Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lte|lt|in)\b/g,
    (match) => `$${match}`
  );

  // * Finding resource
  query = model.find(JSON.parse(queryStr));

  // * Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // * Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // * DEFAULT SORTING BY DATE
  }

  // * Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // * Executing query
  // const bootcamps = await Bootcamp.find(req.query);
  const results = await query;

  // * Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };
  next();
};

module.exports = advancedResults;
