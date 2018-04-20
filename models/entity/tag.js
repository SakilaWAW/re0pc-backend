const Tag = function(uuid, tag) {
  this.uuid = uuid;
  this.tag = tag;
};

Tag.createWith = function (jsonObj) {
  return new Tag(jsonObj.uuid, jsonObj.tag);
};

Tag.prototype.equals = function(t) {
  return this.uuid === t.uuid && this.tag === t.tag;
};

Tag.prototype.inArray = function(tagArr) {
  for (let i = 0; i < tagArr.length; i++) {
    if(this.equals(tagArr[i])) return true;
  }
  return false;
};

module.exports = Tag;