import Ember from 'ember';

export default Ember.Route.extend({
  ajax: Ember.inject.service(),

  _getRawData(sessionId){
    return this.get('ajax')
           .request("/raw-tracking-sessions/"+ sessionId +"/data-points"
           + "?start=2017-08-06T13:35:00" +
            "&end=2017-08-06T13:37:16")

          //)
           .then(data => {
             return data.map((d) => {
               return [d["x-value"], d["y-value"], d["timestamp"]];
             });
           });
  },
  model(){
    return this.store.findRecord('tracking-session',
                  "59871B179368210007000141",
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
