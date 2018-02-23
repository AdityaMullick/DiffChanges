define('GroupBy', [], function() {


// code

    function Diff(opcode, payload, path) {
        this.opcode = opcode;
        this.payload = payload;
        this.path = path;

    }

    function GroupBy() {
        // maps all the id numbers of the users to their country
        var helper = {};
        this.groupBy = function (users, attr) {
            var groupBy = {};
            // if users is a bag
            if (users && typeof users == 'object' && typeof users.constructor == "function") { // use lodash is plain object
                // iterate through object and create group map
                var keys = Object.keys(users);
                helper[attr] = {};
                for (value in keys) {
                    var userId = keys[value];
                    // if the user does not have the attribute, then don't process
                    if (typeof users[userId][attr] == "undefined") {
                        if (typeof groupBy["null"] == "undefined") {
                            // add key to maop
                            groupBy["null"] = {};
                            groupBy["null"][attr] = attrVal;
                            groupBy["null"]["visitors"] = {};

                            // assume that all users have an id
                            groupBy["null"]["visitors"][userId] = users[userId];
                        }
                        else {
                            groupBy["null"]["visitors"][userId] = users[userId];
                        }
                        helper[attr][userId] = "null";
                        continue;

                        // null, undefined assign users to the "null" group
                    }
                    var attrVal = users[userId][attr];
                    helper[attr][userId] = users[userId][attr];
                    if (typeof groupBy[attrVal] == "undefined") {
                        // add key to maop
                        groupBy[attrVal] = {};
                        groupBy[attrVal][attr] = attrVal;
                        groupBy[attrVal]["visitors"] = {};

                        // assume that all users have an id
                        groupBy[attrVal]["visitors"][userId] = users[userId];

                    }
                    else {
                        groupBy[attrVal]["visitors"][userId] = users[userId];
                    }
                }
            }
            return groupBy;

        }


        // return
        this.insert = function (diff) {
            // insert cases
            // 1. Insert a new user
            var user = diff.payload;
            var splitPath = diff.path.split(".");
            var userId;
            var idIndex = -1;
            var restOfPath = "";
            // find user id in path
            for (var i = 0; i < splitPath.length; i++) {

                if (idIndex > -1) {
                    restOfPath += splitPath[i];

                }
                if (splitPath[i].includes("id")) {
                    userId = splitPath[i];
                    idIndex = i;

                }


            }
            var attribute = Object.keys(helper)[0]; // country


            // update the helper method
            if (helper[attribute][userId] == undefined) {
                // user does not exist
                var value = diff.payload[attribute];
                helper[attribute][userId] = value;

            }
            var attributeValue = helper[attribute][userId];

            // return the output diff
            var returnPath = "";
            if (restOfPath == "") {
                returnPath = "out." + attributeValue + ".visitors." + userId;

            }
            else {
                returnPath = "out." + attributeValue + ".visitors." + userId + "." + restOfPath;

            }
            return new Diff(diff.opcode, diff.payload, returnPath);

        };

        // can the payload include properties???????
        this.delete = function (diff) {
            // there is no payload, so return empty for payload
            var splitPath = diff.path.split(".");
            var userId;
            var idIndex = -1;
            var restOfPath = "";
            for (var i = 0; i < splitPath.length; i++) {
                if (idIndex > -1) {
                    restOfPath += splitPath[i];
                }
                if (splitPath[i].includes("id")) {
                    userId = splitPath[i];
                    idIndex = i;
                }
            }
            var attribute = Object.keys(helper)[0];
            // update the helper method
            if (helper[attribute][userId] == undefined) {
                // user does not exist
                var value = diff.payload[attribute];
                if (value == undefined) {
                    value = "null";
                }
                helper[attribute][userId] = value;

            }
            var attributeValue = helper[attribute][userId];
            // remove the corresponding user from helper map
            if (idIndex == splitPath.length - 1) {
                // user was requested to be removed
                delete helper[attribute][userId];
            }

            var returnPath;
            // return the output diff
            if (restOfPath == "") {
                returnPath = "out." + attributeValue + ".visitors." + userId + restOfPath;

            }
            else {
                returnPath = "out." + attributeValue + ".visitors." + userId + "." + restOfPath;

            }
            return new Diff(diff.opcode, "", returnPath)

        };

        this.update = function (diff) {
            var diffs = [];
            var returnPath;
            var splitPath = diff.path.split(".");
            var userId;
            var idIndex;
            var restOfPath = "";
            for (var i = 0; i < splitPath.length; i++) {
                if (idIndex > -1) {
                    restOfPath += splitPath[i];

                }
                if (splitPath[i].includes("id")) {
                    userId = splitPath[i];
                    idIndex = i;
                }
            }
            // if idIndex is the last element, then we are updating a user
            if (idIndex == splitPath.length - 1) {
                // update user and return diff
                var user = diff.payload;
                var attribute = Object.keys(helper)[0];
                var attributeValue = user[attribute];
                var oldAttributeValue = helper[attribute][userId];
                // changing the user might need two diffs(one delete and another insert)
                if (attributeValue == oldAttributeValue) {
                    // attribute values are equal so simply replace
                    returnPath = "out." + attributeValue + ".visitors." + userId;
                    return new Diff("update", diff.payload, returnPath);
                }
                else {
                    // there will be a change in the groupBy attribute

                    // update the helper
                    helper[attribute][userId] = attributeValue;
                    var deleteReturnPath = "out." + oldAttributeValue + ".visitors." + userId;
                    var insertReturnPath = "out." + attributeValue + ".visitors." + userId;
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
                returnPath = "out." + attributeValue + ".visitors." + userId + "." + restOfPath;

                if (splitPath[splitPath.length - 1] == Object.keys(helper)[0]) {
                    // here, we are updating the attribute, so we must update the helper map
                    helper[attribute][userId] = updatedValue;
                    // we must create two diffs since the attribute will change
                    var deleteDiff;
                    var insertDiff;
                    var updateDiff;
                    deleteDiff = new Diff("delete", "", "out." + attributeValue + ".visitors." + userId);
                    insertDiff = new Diff("insert", "out." + userId, "out." + diff.payload + ".visitors." + userId);
                    updateDiff = new Diff("update", diff.payload, "out." + diff.payload + ".visitors." + userId);

                    return [deleteDiff, insertDiff, updateDiff];
                }

                diffs.push(new Diff("update", diff.payload, returnPath));
                return diffs;

            }
        }
    }
});