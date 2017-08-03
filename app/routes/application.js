import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),

  _getRawData(sessionId){
    return this.get('ajax')
           .request("/raw-tracking-sessions/"+ sessionId +"/data-points")
           .then(data => {
             return data.map((d) => {
               return [d["x-value"], d["y-value"]];
             });
           });
  },
  model(){
    return this.store.findRecord('tracking-session',
                  "59823EFEF1ABCD000700000A",
                  {include: "anchors-configuration,anchors-configuration.deployed-anchors" +
                  ",anchors-configuration.deployed-anchors.point-coordinate"});
                },

  afterModel(model){
      return this._getRawData(model.get("rawTrackingSessionId"))
      .then(rawData => {
        model.set("rawData", rawData);
      });
    }
});
