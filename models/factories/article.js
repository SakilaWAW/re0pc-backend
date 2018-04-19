const Article = function(uuid, fileName, content, type, count, tags) {
  this.id = uuid;
  this.title = fileName;
  this.content = content;
  this.type = type;
  this.count = count;
  this.tag = tags;
};

module.exports = Article;