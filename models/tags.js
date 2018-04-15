module.exports = function(sequelize, DataTypes){
  return sequelize.define('tags', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tag: String(20),
  },{
    timestamps: false,
    comment: '独立出标签表以便查询',
  });
};