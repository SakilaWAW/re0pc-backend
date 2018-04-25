module.exports = function(sequelize, DataTypes){
  return sequelize.define('tags', {
    uuid: {
      type: DataTypes.UUID,
      references: {
        model: 'articles',
        key: 'id',
      },
      primaryKey: true,
    },
    tag: {
      type: DataTypes.STRING(20),
      primaryKey: true,
    },
  },{
    timestamps: false,
    comment: '独立出标签表以便查询',
  });
};