// A simple todo model
var Todo = Backbone.Model.extend({
    defaults: { title: "New Todo" }
});

// Create a Firebase.Collection and set the 'firebase' property
// to the URL of our database
var TodoCollection = Backbone.Firebase.Collection.extend({
    model: Todo,
    url: "https://intense-inferno-5722.firebaseio.com"
});

var TodoView = Backbone.View.extend({
    tagName: "li",
    template: _.template("<%= title %>"),
    initialize: function() {
        this.listenTo(this.model, "change", this.render);
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

// The view for the entire application
var AppView = Backbone.View.extend({
    el: $('#todoapp'),
    events: {
        'click #add-todo': 'createTodo',
        'click #search-button': 'getFoodItems'
    },
    initialize: function() {
        this.list = this.$('#todo-list'); // the list to append to
        this.input = this.$('#new-todo'); // the textbox for new todos
        // by listening to when the collection changes we
        // can add new items in realtime
        this.listenTo(this.collection, 'add', this.addOne);
        this.searchInput = this.$('#search-input');
        this.searchButton = this.$('#search-button');

    },
    addOne: function(todo) {
        var view = new TodoView({ model: todo });
        this.list.append(view.render().el);
    },
    createTodo: function(e) {
        if (!this.input.val()) {
            return;
        }
        // create a new location in firebase and save the model data
        // this will trigger the listenTo method above and a new todo view
        // will be created as well
        this.collection.create({ title: this.input.val() });
        this.input.val('');
    },
    createFoodLogRecord: function(e) {
        // create a new location in firebase and save the model data
        // this will trigger the listenTo method above and a new todo view
        // will be created as well

        this.collection.create({ title: e });
        this.input.val('');
    },
    // Query the Nutritionix API using the value of the search input.
    // Display the results (food items) 
    getFoodItems: function() {
        var queryString = $('#search-input').val();
        this.queryNutritionixAPI(queryString);
        
        // For now create item using query string
        this.createFoodLogRecord(queryString);
    },

    // Nutritionix API query
    queryNutritionixAPI: function(queryString) {
        var queryUrl = 'https://api.nutritionix.com/v1_1/search/' +
            queryString +
            '?fields=item_name%2Citem_id%2Cbrand_name%2Cnf_calories' +
            '%2Cnf_sugars%2Cnf_saturated_fat%2Cnf_sodium' +
            '&appId=8c1adda0&appKey=99e51ebebe522453c0f10c70f4eb4738';

        $.getJSON(queryUrl)
            .done(function(json) {
                if (json.hits.length > 0) {
                    var result = json.hits[0].fields.item_name;
                    console.log("Search result: " + result);

                    // write result to #results-list using jQuery
                    // TODO: display this in a view using Backbone
                    $('#results-list').append('<li>' + result + '</li>');

                } else {
                    console.log("Your search: " + queryString + " did not match any listings in the Nutritionix database");
                }
            })
            .fail(function(jqxhr) {
                console.log("Error getting food info from Nutritionix");
                //write the returned object to console
                console.log(jqxhr);
            });
    }
});


// Create a function to kick off our BackboneFire app
function init() {
    // The data we are syncing from our remote Firebase database
    var collection = new TodoCollection();
    var app = new AppView({ collection: collection });
}
// When the document is ready, call the init function
$(function() {
    init();
});
