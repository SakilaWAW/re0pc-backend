module.exports = function(sequelize, DataTypes){
  return sequelize.define('articles', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    title: DataTypes.STRING(30),
    content: DataTypes.TEXT,
    type: DataTypes.STRING(20),
    count: DataTypes.INTEGER,
  },{
    timestamps: true,
    comment: '文章信息表',
  });
};