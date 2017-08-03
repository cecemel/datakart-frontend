import DS from 'ember-data';

export default DS.Model.extend({
   description: DS.attr('string'),
   rawTrackingSessionId: DS.attr('string'),
   startTime: DS.attr('string'),
   endTime: DS.attr('string'),
   anchorsConfiguration: DS.belongsTo('anchors-configuration'),

});
