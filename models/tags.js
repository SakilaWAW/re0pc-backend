module.exports = function(sequelize, DataTypes){
  return sequelize.define('tags', {
    uuid: {
      type: DataTypes.UUID,
      references: {
        model: 'articles',
        key: 'id',
      },
    },
    tag: DataTypes.STRING(20),
  },{
    timestamps: false,
    comment: '独立出标签表以便查询',
  });
};