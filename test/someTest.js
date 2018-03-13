

define([], function(App, $, _) {


    describe('Checking diff function', function() {

        it('Checking groupBy country', function() {


            var users = loadUsersBag();
            var users1 = loadUsersArr();
            var emptyUsers = {};

            var groupBy = new GroupBy();
            var grouped = groupBy.groupBy(users, "country", "visitors");
            var g = new GroupBy();
            var g1 = g.groupBy(users1, "country", "visitors");


            // check country group
            expect(Object.keys(grouped["Spain"]["visitors"]).length).toEqual(3);
            expect(Object.keys(grouped["null"]["visitors"]).length).toEqual(2);
            expect(Object.keys(grouped["USA"]["visitors"]).length).toEqual(1);

            // check entire object
            expect(grouped).toEqual({"Spain":{"country":"Spain","visitors":{"id1":{"country":"Spain","latitude":57,"longitude":83,"name":"Sam"},"id2":{"country":"Spain","latitude":57,"longitude":83,"name":"Rajiv"},"id3":{"country":"Spain","latitude":57,"longitude":83,"name":"Sam"}}},
                "USA":{"country":"USA","visitors":{"id4":{"country":"USA","latitude":57,"longitude":83,"name":"Samantha"}}},"India":{"country":"India","visitors":{"id5":{"country":"India","latitude":57,"longitude":83,"name":"Harry"}}},"null":{"country":"India","visitors":{"id6":{"latitude":57,"longitude":83,"jobs":["Surgeon","Engineer"]},"id11":{"latitude":57,"longitude":83,"jobs":["Surgeon","Engineer","Doctor"]}}}});
        });
        it('Checking groupBy name', function() {


            var users = loadUsersBag();

            var nameGroupBy = new GroupBy();
            var nameGrouped = nameGroupBy.groupBy(users, "name", "names");


            // check name group by
            expect(Object.keys(nameGrouped["null"]["names"]).length).toEqual(2);
            expect(Object.keys(nameGrouped["Sam"]["names"]).length).toEqual(2);

            // check entire object
            expect(nameGrouped).toEqual({"Sam":{"name":"Sam","names":{"id1":{"country":"Spain","latitude":57,"longitude":83,"name":"Sam"},"id3":{"country":"Spain","latitude":57,"longitude":83,"name":"Sam"}}},"Rajiv":{"name":"Rajiv","names":{"id2":{"country":"Spain","latitude":57,"longitude":83,"name":"Rajiv"}}},"Samantha":{"name":"Samantha","names":{"id4":{"country":"USA","latitude":57,"longitude":83,"name":"Samantha"}}},"Harry":{"name":"Harry","names":{"id5":{"country":"India","latitude":57,"longitude":83,"name":"Harry"}}},"null":{"name":"Harry","names":{"id6":{"latitude":57,"longitude":83,"jobs":["Surgeon","Engineer"]},"id11":{"latitude":57,"longitude":83,"jobs":["Surgeon","Engineer","Doctor"]}}}});


        });


        it('Checking insert diffs', function() {

            var users = loadUsersBag();
            var users1 = loadUsersArr();


            var groupBy = new GroupBy();
            var grouped = groupBy.groupBy(users, "country", "visitors");

            var groupByArr = new GroupBy();
            var groupedArr = groupByArr.groupBy(users1, "country", "visitors");
            // create insert diff
            var insertDiff1 = new Diff("insert", "Aditya", "users[0].name" );

            var out = groupByArr.insert(insertDiff1);

            var insertDiff = new Diff("insert", "Aditya", "users.id1.name" );

            // insert properties
            var output = groupBy.insert(insertDiff);
            expect(output.opcode).toEqual("insert");
            expect(output.payload).toEqual("Aditya");
            expect(output.path).toEqual("out.Spain.visitors.id1.name");

            // adding a property
            var output1 = groupBy.insert(new Diff("insert", {"hello": "hi"}, "users.id2.new"));
            expect(output1.path).toEqual("out.Spain.visitors.id2.new");


            // adding a user with country
            var output3 = groupBy.insert(new Diff("insert", {"country": "Greece"}, "users.id9"));
            expect(output3.path).toEqual("out.Greece.visitors.id9");

            // adding a user with country
            var output4 = groupBy.insert(new Diff("insert", {"country": "null"}, "users.id10"));
            expect(output4.path).toEqual("out.null.visitors.id10");



            // adding a property to arr
            var output5 = groupByArr.insert(new Diff("insert", {"hello": "hi"}, "users[1].new"));
            expect(output5.path).toEqual("out.Spain.visitors.1.new");

            // adding a user with country to arr
            var output6 = groupByArr.insert(new Diff("insert", {"country": "Greece"}, "users[8]"));
            expect(output6.path).toEqual("out.Greece.visitors.8");

            // adding a user with country to arr
            var output7 = groupByArr.insert(new Diff("insert", {"country": "null"}, "users[9]"));
            expect(output7.path).toEqual("out.null.visitors.9");


        });
        it('Checking delete diffs', function() {

            var users = loadUsersBag();
            var users1 = loadUsersArr();


            var groupBy = new GroupBy();
            var grouped = groupBy.groupBy(users, "country", "visitors");

            var groupByArr = new GroupBy();
            var groupedArr = groupByArr.groupBy(users1, "country", "visitors");


            var output1;
            var output2;
            var output3;
            var output4;
            var output5;
            var output6;

            // deleting a user
            output1 = groupBy.delete(new Diff("delete", "", "users.id6"));
            expect(output1.path).toEqual("out.null.visitors.id6");

            // deleting a property
            output2 = groupBy.delete(new Diff("delete", "", "users.id6.jobs"));
            expect(output2.path).toEqual("out.null.visitors.id6.jobs");

            // deleting a user
            output3 = groupBy.delete(new Diff("delete", "", "users.id2"));
            expect(output3.path).toEqual("out.Spain.visitors.id2");

            // deleting a user for array;
            output4 = groupByArr.delete(new Diff("delete", "", "users[5]"));
            expect(output4.path).toEqual("out.null.visitors.5");

            // deleting a property for array
            output5 = groupByArr.delete(new Diff("delete", "", "users[5].jobs"));
            expect(output5.path).toEqual("out.null.visitors.5.jobs");

            // deleting a user for array
            output6 = groupByArr.delete(new Diff("delete", "", "users[1]"));
            expect(output6.path).toEqual("out.Spain.visitors.1");



        });
        it('Checking update diffs', function() {
            var users = loadUsersBag();
            var users1 = loadUsersArr();

            var emptyUsers = {};

            var groupBy = new GroupBy();
            var grouped = groupBy.groupBy(users, "country", "visitors");


            var groupByArr = new GroupBy();
            var groupedArr = groupByArr.groupBy(users1, "country", "visitors");



            var output1;
            var output2;
            var output3;

            // update property of user
            output1 = groupBy.update(new Diff("update", 50, "users.id1.latitude"));
            expect(output1[0].path).toEqual("out.Spain.visitors.id1.latitude");
            expect(output1[0].opcode).toEqual("update");

            // update user
            output3 = groupBy.update(new Diff("update", {"country": "Spain"}, "users.id2"));
            expect(output3.opcode).toEqual("update");

            // update user
            output2 = groupBy.update(new Diff("update", {"country": "China"}, "users.id6"));
            expect(output2.length).toEqual(2);
            expect(output2[0].opcode).toEqual("delete");
            expect(output2[0].path).toEqual("out.null.visitors.id6");
            expect(output2[1].opcode).toEqual("insert");
            expect(output2[1].path).toEqual("out.China.visitors.id6");

            // update the country of a user
            output4 = groupBy.update(new Diff("update", "Mexico", "users.id3.country"));
            // three diffs
            expect(output4.length).toEqual(3);
            expect(output4[0].opcode).toEqual("delete");
            expect(output4[0].path).toEqual("out.Spain.visitors.id3");

            expect(output4[1].opcode).toEqual("insert");
            expect(output4[1].path).toEqual("out.Mexico.visitors.id3");

            expect(output4[2].opcode).toEqual("update");
            expect(output4[2].path).toEqual("out.Mexico.visitors.id3");
            expect(output4[2].payload).toEqual("Mexico");


            // update property of user in array
            output1 = groupByArr.update(new Diff("update", 50, "users[0].latitude"));
            expect(output1[0].path).toEqual("out.Spain.visitors.0.latitude");
            expect(output1[0].opcode).toEqual("update");

            // update user in array
            output3 = groupByArr.update(new Diff("update", {"country": "Spain"}, "users[1]"));
            expect(output3.opcode).toEqual("update");

            // update user in array
            output2 = groupByArr.update(new Diff("update", {"country": "China"}, "users[5]"));
            expect(output2.length).toEqual(2);
            expect(output2[0].opcode).toEqual("delete");
            expect(output2[0].path).toEqual("out.null.visitors.5");
            expect(output2[1].opcode).toEqual("insert");
            expect(output2[1].path).toEqual("out.China.visitors.5");
            // update the country of a user

            output4 = groupByArr.update(new Diff("update", "Mexico", "users[2].country"));
            // three diffs
            expect(output4.length).toEqual(3);
            expect(output4[0].opcode).toEqual("delete");
            expect(output4[0].path).toEqual("out.Spain.visitors.2");
            expect(output4[1].opcode).toEqual("insert");
            expect(output4[1].path).toEqual("out.Mexico.visitors.2");
            expect(output4[2].opcode).toEqual("update");
            expect(output4[2].path).toEqual("out.Mexico.visitors.2");
            expect(output4[2].payload).toEqual("Mexico");



        })


    });

});









// code

function Diff(opcode, payload, path) {
    this.opcode = opcode;
    this.payload = payload;
    this.path = path;

}

function GroupBy() {
    // maps all the id numbers of the users to their country
    var helper = {};
    var groupName;
    var groupKey;
    var helperArr;
    this.isArr = false;
    this.groupBy = function(users, attr, name) {
        var groupBy = {};
        groupName = name;
        groupKey = attr;
        helperArr = new Array(users.length);
        // if users is a bag

        // TODO: Use lodash isUndefined isPlainObject and isNull instead.
        if(!(users instanceof Array)) { // use lodash is plain object
            // iterate through object and create group map
            helper[attr] = {};


            // TODO: Add assertion (check) in case when the input: attr is undefined
            // Throw an error message if that happens.
            for(userId in users) {
                // if the user does not have the attribute, then don't process
                if(typeof users[userId][attr] == "undefined") {
                    if(typeof groupBy["null"] == "undefined") {
                        // add key to maop
                        groupBy["null"] = {};
                        groupBy["null"][attr] = attrVal;
                        groupBy["null"][name] = {};

                        // assume that all users have an id
                        groupBy["null"][name][userId] = users[userId];
                    }
                    else {
                        groupBy["null"][name][userId] = users[userId];
                    }
                    helper[attr][userId] = "null";

                    // null, undefined assign users to the "null" group
                }
                else {
                    var attrVal = users[userId][attr];
                    helper[attr][userId] = users[userId][attr];
                    if (typeof groupBy[attrVal] == "undefined") {
                        // add key to maop
                        groupBy[attrVal] = {};
                        groupBy[attrVal][attr] = attrVal;
                        groupBy[attrVal][name] = {};

                        // assume that all users have an id
                        groupBy[attrVal][name][userId] = users[userId];

                    }
                    else {
                        groupBy[attrVal][name][userId] = users[userId];
                    }
                }
            }
        }
        else {
            this.isArr = true;
            for(var userId = 0; userId < users.length; userId++) {
                if(typeof users[userId][attr] == "undefined") {
                    if(typeof groupBy["null"] == "undefined") {
                        // add key to maop
                        groupBy["null"] = {};
                        groupBy["null"][attr] = attrVal;
                        groupBy["null"][name] = {};

                        // assume that all users have an id
                        groupBy["null"][name][userId] = users[userId];
                    }
                    else {
                        groupBy["null"][name][userId] = users[userId];
                    }
                    helperArr[userId] = "null";

                    // null, undefined assign users to the "null" group
                }
                else {
                    var attrVal = users[userId][attr];
                    helperArr[userId] = users[userId][attr];
                    if (typeof groupBy[attrVal] == "undefined") {
                        // add key to maop
                        groupBy[attrVal] = {};
                        groupBy[attrVal][attr] = attrVal;
                        groupBy[attrVal][name] = {};

                        // assume that all users have an id
                        groupBy[attrVal][name][userId] = users[userId];

                    }
                    else {
                        groupBy[attrVal][name][userId] = users[userId];
                    }
                }

            }


        }
        return groupBy;

    }



    // result = {
    //     'USA' : {
    //         'visitors' : {
    //             'uid1': user
    //         }
    // }




    // return
    this.insert = function(diff){
        if(this.isArr) {
            // insert cases
            // 1. Insert a new user
            var user = diff.payload;
            var splitPath = diff.path.split(".");
            var userId;
            var idIndex = -1;
            var restOfPath = "";
            // find user id in path
            var found = false;
            for(var i = 0; i < splitPath.length; i++) {

                if(idIndex > -1) {
                    restOfPath += splitPath[i];

                }
                if(splitPath[i].indexOf("[") != -1 && !found) {
                    found = true;
                    userId = splitPath[i][splitPath[i].indexOf("[") + 1];
                    idIndex = i;
                }


            }
            var attribute = groupKey;// country


            // update the helper method
            if(helperArr[userId] == undefined) {
                // user does not exist
                var value = diff.payload[attribute];
                helperArr[userId] = value;

            }
            var attributeValue = helperArr[userId];

            // return the output diff
            var returnPath = "";
            if(restOfPath == "") {
                returnPath = "out." + attributeValue + "." + groupName + "." + userId;

            }
            else {
                returnPath = "out." + attributeValue + "." + groupName + "." + userId + "." + restOfPath;

            }
            return new Diff(diff.opcode, diff.payload, returnPath);
        }
        else {
            // insert cases
            // 1. Insert a new user
            var user = diff.payload;
            var splitPath = diff.path.split(".");
            var userId;
            var idIndex = -1;
            var restOfPath = "";
            // find user id in path
            for(var i = 0; i < splitPath.length; i++) {

                if(idIndex > -1) {
                    restOfPath += splitPath[i];

                }
                if(splitPath[i].includes("id")) {
                    userId = splitPath[i];
                    idIndex = i;

                }


            }
            var attribute = Object.keys(helper)[0]; // country


            // update the helper method
            if(helper[attribute][userId] == undefined) {
                // user does not exist
                var value = diff.payload[attribute];
                helper[attribute][userId] = value;

            }
            var attributeValue = helper[attribute][userId];

            // return the output diff
            var returnPath = "";
            if(restOfPath == "") {
                returnPath = "out." + attributeValue + "." + groupName + "." + userId;

            }
            else {
                returnPath = "out." + attributeValue + "." + groupName + "." + userId + "." + restOfPath;

            }
            return new Diff(diff.opcode, diff.payload, returnPath);

        }


    };

    // can the payload include properties???????
    this.delete = function(diff){
        if(this.isArr) {
            // there is no payload, so return empty for payload
            var splitPath = diff.path.split(".");
            var userId;
            var idIndex = -1;
            var restOfPath = "";
            var found = false;
            for(var i = 0; i < splitPath.length; i++) {
                if(idIndex > -1) {
                    restOfPath += splitPath[i];
                }
                if(splitPath[i].indexOf("[") != -1 && !found) {
                    found = true;
                    userId = splitPath[i][splitPath[i].indexOf("[") + 1];
                    idIndex = i;
                }
            }
            var attribute = groupKey;
            // update the helper method
            if(helperArr[userId] == undefined) {
                // user does not exist
                var value = diff.payload[attribute];
                if(value == undefined) {
                    value = "null";
                }
                helperArr[userId] = value;

            }
            var attributeValue = helperArr[userId];
            // remove the corresponding user from helper map
            if(idIndex == splitPath.length - 1) {
                // user was requested to be removed
                helperArr.splice(userId, 1);
            }

            var returnPath;
            // return the output diff
            if(restOfPath == "") {
                returnPath = "out." + attributeValue + "." + groupName + "." + userId + restOfPath;

            }
            else {
                returnPath = "out." + attributeValue + "." + groupName + "." + userId + "." + restOfPath;

            }
            return new Diff(diff.opcode, "", returnPath)

        }
        else {
            // there is no payload, so return empty for payload
            var splitPath = diff.path.split(".");
            var userId;
            var idIndex = -1;
            var restOfPath = "";
            for(var i = 0; i < splitPath.length; i++) {
                if(idIndex > -1) {
                    restOfPath += splitPath[i];
                }
                if(splitPath[i].includes("id")) {
                    userId = splitPath[i];
                    idIndex = i;
                }
            }
            var attribute = Object.keys(helper)[0];
            // update the helper method
            if(helper[attribute][userId] == undefined) {
                // user does not exist
                var value = diff.payload[attribute];
                if(value == undefined) {
                    value = "null";
                }
                helper[attribute][userId] = value;

            }
            var attributeValue = helper[attribute][userId];
            // remove the corresponding user from helper map
            if(idIndex == splitPath.length - 1) {
                // user was requested to be removed
                delete helper[attribute][userId];
            }

            var returnPath;
            // return the output diff
            if(restOfPath == "") {
                returnPath = "out." + attributeValue + "." + groupName + "." + userId + restOfPath;

            }
            else {
                returnPath = "out." + attributeValue + "." + groupName + "." + userId + "." + restOfPath;

            }
            return new Diff(diff.opcode, "", returnPath)
        }


    };

    this.update = function(diff) {
        if(this.isArr) {
            var diffs = [];
            var returnPath;
            var splitPath = diff.path.split(".");
            var userId;
            var idIndex;
            var restOfPath = "";
            var found = false;
            for(var i = 0; i < splitPath.length; i++) {
                if(idIndex > -1) {
                    restOfPath += splitPath[i];

                }
                if(splitPath[i].indexOf("[") != -1 && !found) {
                    found = true;
                    userId = splitPath[i][splitPath[i].indexOf("[") + 1];
                    idIndex = i;
                }
            }
            // if idIndex is the last element, then we are updating a user
            if(diff.path[diff.path.length - 1] == ']') {
                // update user and return diff
                var user = diff.payload;
                var attribute = groupKey;
                var attributeValue = user[attribute];
                var oldAttributeValue = helperArr[userId];
                // changing the user might need two diffs(one delete and another insert)
                if(attributeValue == oldAttributeValue) {
                    // attribute values are equal so simply replace
                    returnPath = "out." + attributeValue + "." + groupName + "." + userId;
                    return new Diff("update", diff.payload, returnPath);
                }
                else {
                    // there will be a change in the groupBy attribute

                    // update the helper
                    helperArr[userId] = attributeValue;
                    var deleteReturnPath = "out." + oldAttributeValue + "." + groupName + "." + userId;
                    var insertReturnPath = "out." + attributeValue + "." + groupName + "." + userId;
                    diffs.push(new Diff("delete", "", deleteReturnPath));

                    diffs.push(new Diff("insert", user, insertReturnPath));
                    return diffs;
                }
            }
            else {
                // we are simply updating a property of the user
                var updatedValue = diff.payload;
                var attribute = groupKey;
                var attributeValue = helperArr[userId];
                returnPath = "out." + attributeValue + "." + groupName + "." + userId + "." + restOfPath;

                if(splitPath[splitPath.length - 1] == groupKey) {
                    // here, we are updating the attribute, so we must update the helper map
                    helperArr[userId] = updatedValue;
                    // we must create two diffs since the attribute will change
                    var deleteDiff;
                    var insertDiff;
                    var updateDiff;
                    deleteDiff = new Diff("delete", "", "out." + attributeValue + "." + groupName + "." + userId);
                    insertDiff = new Diff("insert", "out." + userId, "out." + diff.payload + "." + groupName + "." + userId);
                    updateDiff = new Diff("update", diff.payload, "out." + diff.payload + "." + groupName + "." + userId);

                    return [deleteDiff, insertDiff, updateDiff];
                }

                diffs.push(new Diff("update", diff.payload, returnPath));
                return diffs;

            }
        }
        else {
            var diffs = [];
            var returnPath;
            var splitPath = diff.path.split(".");
            var userId;
            var idIndex;
            var restOfPath = "";
            for(var i = 0; i < splitPath.length; i++) {
                if(idIndex > -1) {
                    restOfPath += splitPath[i];

                }
                if(splitPath[i].includes("id")) {
                    userId = splitPath[i];
                    idIndex = i;
                }
            }
            // if idIndex is the last element, then we are updating a user
            if(idIndex == splitPath.length - 1) {
                // update user and return diff
                var user = diff.payload;
                var attribute = Object.keys(helper)[0];
                var attributeValue = user[attribute];
                var oldAttributeValue = helper[attribute][userId];
                // changing the user might need two diffs(one delete and another insert)
                if(attributeValue == oldAttributeValue) {
                    // attribute values are equal so simply replace
                    returnPath = "out." + attributeValue + "." + groupName + "." + userId;
                    return new Diff("update", diff.payload, returnPath);
                }
                else {
                    // there will be a change in the groupBy attribute

                    // update the helper
                    helper[attribute][userId] = attributeValue;
                    var deleteReturnPath = "out." + oldAttributeValue + "." + groupName + "." + userId;
                    var insertReturnPath = "out." + attributeValue + "." + groupName + "." + userId;
                    diffs.push(new Diff("delete", "", deleteReturnPath));

                    diffs.push(new Diff("insert", user, insertReturnPath));
                    return diffs;
                }
            }
            else {
                // we are simply updating a property of the user
                var updatedValue = diff.payload;
                var attribute = Object.keys(helper)[0];
                var attributeValue = helper[attribute][userId];
                returnPath = "out." + attributeValue + "." + groupName + "." + userId + "." + restOfPath;

                if(splitPath[splitPath.length - 1] == Object.keys(helper)[0]) {
                    // here, we are updating the attribute, so we must update the helper map
                    helper[attribute][userId] = updatedValue;
                    // we must create two diffs since the attribute will change
                    var deleteDiff;
                    var insertDiff;
                    var updateDiff;
                    deleteDiff = new Diff("delete", "", "out." + attributeValue + "." + groupName + "." + userId);
                    insertDiff = new Diff("insert", "out." + userId, "out." + diff.payload + "." + groupName + "." + userId);
                    updateDiff = new Diff("update", diff.payload, "out." + diff.payload + "." + groupName + "." + userId);

                    return [deleteDiff, insertDiff, updateDiff];
                }

                diffs.push(new Diff("update", diff.payload, returnPath));
                return diffs;

            }
        }

    }


}


function loadUsersArr() {
    var users = [{
        "country": "Spain",
        "latitude": 57,
        "longitude": 83,
        "name": "Sam"

    },
        {
            "country": "Spain",
            "latitude": 57,
            "longitude": 83,
            "name": "Rajiv"


        },
        {
            "country":"Spain",
            "latitude": 57,
            "longitude": 83,
            "name": "Sam"


        },
        {
            "country": "USA",
            "latitude": 57,
            "longitude": 83,
            "name": "Samantha"


        },
        {
            "country": "India",
            "latitude": 57,
            "longitude": 83,
            "name": "Harry"

        },
        {
            "latitude": 57,
            "longitude": 83,
            "jobs": ["Surgeon", "Engineer"]

        },
        {
            "latitude": 57,
            "longitude": 83,
            "jobs": ["Surgeon", "Engineer", "Doctor"]

        }




    ];
    return users;

}
function loadUsersBag() {
    var users = {};
    users = {
        "id1": {
            "country": "Spain",
            "latitude": 57,
            "longitude": 83,
            "name": "Sam"

        },

        "id2": {
            "country": "Spain",
            "latitude": 57,
            "longitude": 83,
            "name": "Rajiv"


        },
        "id3": {
            "country":"Spain",
            "latitude": 57,
            "longitude": 83,
            "name": "Sam"


        },
        "id4": {
            "country": "USA",
            "latitude": 57,
            "longitude": 83,
            "name": "Samantha"


        },
        "id5": {
            "country": "India",
            "latitude": 57,
            "longitude": 83,
            "name": "Harry"

        },
        "id6": {
            "latitude": 57,
            "longitude": 83,
            "jobs": ["Surgeon", "Engineer"]

        },
        "id11": {
            "latitude": 57,
            "longitude": 83,
            "jobs": ["Surgeon", "Engineer", "Doctor"]

        }



    };
    return users;
    
}









