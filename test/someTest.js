

define([], function(App, $, _) {


    describe('Checking diff function', function() {

        it('Checking groupBy country', function() {


            var users = loadUsers();
            var emptyUsers = {};

            var groupBy = new GroupBy();
            var grouped = groupBy.groupBy(users, "country", "visitors");


            // check country group
            expect(Object.keys(grouped["Spain"]["visitors"]).length).toEqual(3);
            expect(Object.keys(grouped["null"]["visitors"]).length).toEqual(2);
            expect(Object.keys(grouped["USA"]["visitors"]).length).toEqual(1);

            // check entire object
            expect(grouped).toEqual({"Spain":{"country":"Spain","visitors":{"id1":{"country":"Spain","latitude":57,"longitude":83,"name":"Sam"},"id2":{"country":"Spain","latitude":57,"longitude":83,"name":"Rajiv"},"id3":{"country":"Spain","latitude":57,"longitude":83,"name":"Sam"}}},
                "USA":{"country":"USA","visitors":{"id4":{"country":"USA","latitude":57,"longitude":83,"name":"Samantha"}}},"India":{"country":"India","visitors":{"id5":{"country":"India","latitude":57,"longitude":83,"name":"Harry"}}},"null":{"country":"India","visitors":{"id6":{"latitude":57,"longitude":83,"jobs":["Surgeon","Engineer"]},"id11":{"latitude":57,"longitude":83,"jobs":["Surgeon","Engineer","Doctor"]}}}});
        });
        it('Checking groupBy name', function() {


            var users = loadUsers();

            var nameGroupBy = new GroupBy();
            var nameGrouped = nameGroupBy.groupBy(users, "name", "names");

            // check name group by
            expect(Object.keys(nameGrouped["null"]["names"]).length).toEqual(2);
            expect(Object.keys(nameGrouped["Sam"]["names"]).length).toEqual(2);

            // check entire object
            expect(nameGrouped).toEqual({"Sam":{"name":"Sam","names":{"id1":{"country":"Spain","latitude":57,"longitude":83,"name":"Sam"},"id3":{"country":"Spain","latitude":57,"longitude":83,"name":"Sam"}}},"Rajiv":{"name":"Rajiv","names":{"id2":{"country":"Spain","latitude":57,"longitude":83,"name":"Rajiv"}}},"Samantha":{"name":"Samantha","names":{"id4":{"country":"USA","latitude":57,"longitude":83,"name":"Samantha"}}},"Harry":{"name":"Harry","names":{"id5":{"country":"India","latitude":57,"longitude":83,"name":"Harry"}}},"null":{"name":"Harry","names":{"id6":{"latitude":57,"longitude":83,"jobs":["Surgeon","Engineer"]},"id11":{"latitude":57,"longitude":83,"jobs":["Surgeon","Engineer","Doctor"]}}}});


        });


        it('Checking insert diffs', function() {

            var users = loadUsers();
            var emptyUsers = {};

            var groupBy = new GroupBy();
            var grouped = groupBy.groupBy(users, "country", "visitors");


            // create insert diff
            var insertDiff = new Diff("insert", "Aditya", "users.id1.name" );
            // insert properties
            var output = groupBy.insert(insertDiff);
            expect(output.opcode).toEqual("insert");
            expect(output.payload).toEqual("Aditya");
            expect(output.path).toEqual("out.Spain.visitors.id1.name");

            // adding a property
            var output1 = groupBy.insert(new Diff("insert", {"hello": "hi"}, "users.id2.new"));
            expect(output1.path).toEqual("out.Spain.visitors.id2.new");

            // adding a user
            var output2 = groupBy.insert(new Diff("insert", {"hello": "hi"}, "users.id3"));
            expect(output2.path).toEqual("out.Spain.visitors.id3");

            // adding a user with country
            var output3 = groupBy.insert(new Diff("insert", {"country": "Greece"}, "users.id9"));
            expect(output3.path).toEqual("out.Greece.visitors.id9");

            // adding a user with country
            var output4 = groupBy.insert(new Diff("insert", {"country": "null"}, "users.id10"));
            expect(output4.path).toEqual("out.null.visitors.id10");

        });
        it('Checking delete diffs', function() {

            var users = loadUsers();
            var emptyUsers = {};

            var groupBy = new GroupBy();
            var grouped = groupBy.groupBy(users, "country", "visitors");


            var output1;
            var output2;
            var output3;

            // deleting a user
            output1 = groupBy.delete(new Diff("delete", "", "users.id6"));
            expect(output1.path).toEqual("out.null.visitors.id6");

            // deleting a property
            output2 = groupBy.delete(new Diff("delete", "", "users.id6.jobs"));
            expect(output2.path).toEqual("out.null.visitors.id6.jobs");

            // deleting a user
            output3 = groupBy.delete(new Diff("delete", "", "users.id2"));
            expect(output3.path).toEqual("out.Spain.visitors.id2");

        });
        it('Checking update diffs', function() {
            var users = loadUsers();
            var emptyUsers = {};

            var groupBy = new GroupBy();
            var grouped = groupBy.groupBy(users, "country", "visitors");



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
    this.groupBy = function(users, attr, name) {
        var groupBy = {};
        groupName = name;
        // if users is a bag

        // TODO: Use lodash isUndefined isPlainObject and isNull instead.
        if(users && typeof users == 'object' && typeof users.constructor == "function") { // use lodash is plain object
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

    };

    // can the payload include properties???????
    this.delete = function(diff){
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

    };

    this.update = function(diff) {
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

function loadUsers() {
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









