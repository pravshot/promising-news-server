import mongoose from "mongoose";
import NewsEntry from "../models/newsEntry.js";

// main get route that has filters, sorts, etc
export const getNews = async (req, res) => {
  /* parameters for filtering:
  - sortBy: sort by date (default), title, publication, positivity_score
  - sortOrder: asc (default), des
  - keyword: (default="")search in title/author/publication/description
  - startDate: (default=2022-01-01)start date for filtering
  - endDate: (default=Today)end date for filtering
  - maxResults: (default=100)max number of results to return
  */

  // get values for parameters from req.body
  let { sortBy, sortOrder, keyword, startDate, endDate, maxResults } =
    req.query;
  // set default values for parameters if not provided
  const sortByDefault = "date";
  const sortOrderDefault = "asc";
  const keywordDefault = "";
  const startDateDefault = "2022-01-01";
  const endDateDefault = new Date().toISOString().split("T")[0];
  const maxResultsDefault = 100;

  sortBy = sortBy ? sortBy : sortByDefault;
  sortOrder = sortOrder ? sortOrder : sortOrderDefault;
  keyword = keyword ? keyword.toLowerCase() : keywordDefault;
  startDate = startDate ? startDate : startDateDefault;
  endDate = endDate ? endDate : endDateDefault;
  maxResults = maxResults ? maxResults : maxResultsDefault;

  // create query for filtering
  try {
    const newsEntries = await NewsEntry.find();
    const filteredNewsEntries = newsEntries.filter((newsEntry) => {
      const date = newsEntry.date.split("T")[0];
      return (
        date >= startDate &&
        date <= endDate &&
        (newsEntry.title.toLowerCase().includes(keyword) ||
          (newsEntry.author
            ? newsEntry.author.toLowerCase().includes(keyword)
            : false) ||
          (newsEntry.publication
            ? newsEntry.publication.toLowerCase().includes(keyword)
            : false) ||
          (newsEntry.description
            ? newsEntry.description.toLowerCase().includes(keyword)
            : false))
      );
    });
    // sort filtered news entries
    const sortedNewsEntries = filteredNewsEntries.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      } else if (sortBy === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === "publication") {
        return sortOrder === "asc"
          ? a.publication.localeCompare(b.publication)
          : b.publication.localeCompare(a.publication);
      } else if (sortBy === "positivity_score") {
        return sortOrder === "asc"
          ? a.positivity_score - b.positivity_score
          : b.positivity_score - a.positivity_score;
      }
    });
    // reduce sorted news entries to maxResults
    const toSend = sortedNewsEntries.slice(0, maxResults);

    // return results
    res.status(200).json({
      data: toSend,
      totalResults: toSend.length,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getNewsEntry = async (req, res) => {
  try {
    const newsEntry = await NewsEntry.findById(req.params.id);
    res.status(200).json(newsEntry);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createNewsEntry = async (req, res) => {
  const {
    title,
    author,
    description,
    date,
    url,
    image_url,
    publication,
    positivity_score,
  } = req.body;
  // check to see if this news entry already exists
  try {
    const entry = await NewsEntry.findOne({ url: url });
    if (entry) {
      res.status(400).json({ message: "This news entry already exists" });
      return;
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const newEntry = new NewsEntry({
    title,
    author,
    description,
    date,
    url,
    image_url,
    publication,
    positivity_score,
  });
  try {
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateNewsEntry = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    author,
    description,
    date,
    url,
    image_url,
    publication,
    positivity_score,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);

  const updatedEntry = new NewsEntry({
    title,
    author,
    description,
    date,
    url,
    image_url,
    publication,
    positivity_score,
    _id: id,
  });

  const ret = await NewsEntry.findByIdAndUpdate(id, updatedEntry, {
    new: true,
  });
  res.json(ret);
};

export const deleteNewsEntry = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(`No post with id: ${id}`);

  await NewsEntry.findByIdAndRemove(id);
  res.json({ message: "Post deleted successfully." });
};
