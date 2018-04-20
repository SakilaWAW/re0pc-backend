const Tag = require('./tag');

const Article = function(uuid, fileName, content, type, count, tags) {
  this.id = uuid;
  this.title = fileName;
  this.content = content;
  this.type = type;
  this.count = count;
  this.tag = tags;
};

Article.createWith = function (jsonObj) {
  return new Article(jsonObj.id, jsonObj.title, jsonObj.content, jsonObj.type, jsonObj.count, jsonObj.tag);
};

Article.prototype.contentEqualWith = function(article) {
  console.log(`=================Article.prototype.contentEqualWith() = ${article.content === this.content}`);
  return article.content === this.content;
};

Article.prototype.typeEqualWith = function(article) {
  console.log(`=================Article.prototype.typeEqualWith() = ${article.type === this.type}`);
  return article.type === this.type;
};

Article.prototype.tagsEqualWith = function(article) {
  if(this.tag.length !== article.tag.length) return false;
  for (let i = 0; i< this.tag.length; i++) {
    if(!Tag.createWith(this.tag[i]).inArray(article.tag)) return false;
  }
  return true;
};

module.exports = Article;