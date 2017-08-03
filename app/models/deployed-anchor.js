import DS from 'ember-data';

export default DS.Model.extend({
  anchorLabel: DS.attr('string'),
  pointCoordinate: DS.belongsTo('point-coordinate'),
});
