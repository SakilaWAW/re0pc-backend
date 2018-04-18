const create = (uuid, fileName, content, type, count, tags) => {
  return {
    id: uuid,
    title: fileName,
    content,
    type,
    count,
    tag: tags,
  };
};

module.exports = {
  create,
};