import DS from 'ember-data';

export default DS.Model.extend({
    xValue: DS.attr('string'),
    yValue: DS.attr('string'),
    zValue: DS.attr('string'),
});
