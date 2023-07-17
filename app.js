/** @format */

// BUDGET CONTROLLER
var budgetController = (function () {
    var Expenses = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calcPercentage = function () {
        if (data.total.inc > 0) {
            this.percentage = Math.round((this.value / data.total.inc) * 100);
        }
    };

    Expenses.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        total: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    var calculate = {
        incExp: function (type) {
            // Calculate Income or Expenses (depends on type)
            var sum = 0;
            data.allItems[type].forEach(function (item) {
                sum += item.value;
            });
            data.total[type] = sum;
        },
        budget: function () {
            // Calculate final budget
            data.budget = data.total.inc - data.total.exp;
        },
        percentage: function () {
            // Calculate percentage
            if (data.total.inc > 0) {
                data.percentage = Math.round(
                    (data.total.exp / data.total.inc) * 100
                );
            }
        },
    };

    return {
        addItem: function (type, description, value) {
            var newItem, ID;

            //Create new ID
            if (data.allItems[type].length === 0) {
                ID = 0;
            } else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            // Create new item based on 'inc' and 'exp' type
            if (type === "exp") {
                newItem = new Expenses(ID, description, value);
            } else {
                newItem = new Income(ID, description, value);
            }

            // Add item on the list
            data.allItems[type].push(newItem);

            // Return item
            return newItem;
        },

        getItemValue: function (type, ID) {
            var value;
            // Search trough all items for the matching one
            data.allItems[type].forEach(function (item) {
                if (item.id === ID) {
                    value = item.value;
                }
            });
            return value;
        },

        saveItemEdits: function (description, value, type, ID) {
            // Search trough all items for the matching one
            data.allItems[type].forEach(function (item) {
                if (item.id === ID) {
                    // Save description edits
                    item.description = description;
                    // Save value edits
                    item.value = value;
                }
            });
        },

        deleteItem: function (type, ID) {
            var index;

            // Search trough all items for the matching one
            data.allItems[type].forEach(function (item) {
                if (item.id === ID) {
                    // Get index of the matching item
                    index = data.allItems[type].indexOf(item);
                }
            });

            // Delete item
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        updateBudget: function () {
            // Calculate Income or Expenses
            calculate.incExp("inc");
            calculate.incExp("exp");

            // Calculate the Budget
            calculate.budget();

            // Calculate Percentage
            calculate.percentage();
        },

        get: function () {
            return {
                inc: data.total.inc,
                exp: data.total.exp,
                budget: data.budget,
                percentage: data.percentage,
            };
        },

        updatePercentages: function () {
            data.allItems.exp.forEach(function (item) {
                item.calcPercentage();
            });

            return data.allItems.exp;
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (item) {
                return item.getPercentage();
            });
            return allPerc;
        },
    };
})();

// UI CONTROLLER
var UIController = (function () {
    var DOMStrings = {
        itemDescriptionString: "item__description",
        itemValueString: "item__value",
        btnEditString: "item__edit--btn",
        btnDeleteString: "item__delete--btn",
        btnSaveString: "item__save--btn",

        date: ".budget__title--month",
        type: ".add__type",
        description: ".add__description",
        value: ".add__value",
        addButton: ".add__btn",
        incList: ".income__list",
        expList: ".expenses__list",
        incValue: ".budget__income--value",
        expValue: ".budget__expenses--value",
        budgetValue: ".budget__value",
        expPercentage: ".budget__expenses--percentage",
        container: ".container",
        itemDescription: ".item__description",
        itemPercentage: ".item__percentage",
        itemValue: ".item__value",
        btnEdit: ".item__edit--btn",
        btnDelete: ".item__delete--btn",
        btnSave: ".item__save--btn",
    };

    formatNumber = function (num, type) {
        var numArr, int, dec;

        // Format user's input
        // Get an absolute value of the number fixed to two decimals
        numArr = Math.abs(num).toFixed(2);
        // Split on integer and decimal.
        numArr = numArr.split(".");
        int = numArr[0];
        dec = numArr[1];

        // Format integer
        int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        return (type === "exp" ? "-" : "+") + int + "." + dec;
    };

    displayButtons = function (event) {
        event.currentTarget.querySelector(DOMStrings.btnDelete).style.display =
            "block";
        event.currentTarget.querySelector(DOMStrings.btnEdit).style.display =
            "block";
        event.currentTarget.querySelector(
            DOMStrings.itemValue
        ).style.transform = "translateX(" + -20 + "px)";

        // Change style only if item belongs to expenses
        if (/exp/.test(event.currentTarget.id)) {
            event.currentTarget.querySelector(
                DOMStrings.itemPercentage
            ).style.transform = "translateX(" + -20 + "px)";
        }
    };

    removeButtons = function (event) {
        event.currentTarget.querySelector(DOMStrings.btnDelete).style.display =
            "none";
        event.currentTarget.querySelector(DOMStrings.btnEdit).style.display =
            "none";
        event.currentTarget.querySelector(
            DOMStrings.itemValue
        ).style.transform = "translateX(" + 20 + "px)";

        // Change style only if item belongs to expenses
        if (/exp/.test(event.currentTarget.id)) {
            event.currentTarget.querySelector(
                DOMStrings.itemPercentage
            ).style.transform = "translateX(" + 20 + "px)";
        }
    };

    controlEditInput = function (event) {
        var elClassName, input;

        // Allow Backspace
        if (event.keyCode === 8 || event.which === 8) {
            return;
        }

        // Block Enter
        if (event.keyCode === 13 || event.which === 13) {
            event.preventDefault();
        }

        // Block user's input if conditions are true
        input = event.target.innerHTML;
        elClassName = event.target.className;

        if (
            elClassName === DOMStrings.itemDescriptionString &&
            input.length >= 30
        ) {
            event.preventDefault();
        } else if (
            elClassName === DOMStrings.itemValueString &&
            input.length >= 10
        ) {
            event.preventDefault();
        }
    };

    return {
        // Get input value
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.type).value,
                description: document.querySelector(DOMStrings.description)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMStrings.value).value
                ),
            };
        },

        // Clear input fields
        clearFields: function () {
            var fields;

            fields = document.querySelectorAll(
                DOMStrings.description + ", " + DOMStrings.value
            );

            // Clear description and value fields
            fields.forEach(function (cur) {
                cur.value = "";
            });

            // Focus back to the description
            fields[0].focus();
        },

        // Add a new item to the UI
        addItem: function (budgetItem, type) {
            var html, element, UIItem;
            // Create HTML string with placeholder
            if (type === "inc") {
                element = DOMStrings.incList;
                html =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__edit"><button class="item__edit--btn"><i class="material-icons">edit</i></button></div><div class="item__delete"><button class="item__delete--btn"><i class="material-icons">delete</i></button></div><div class="item__save"><button class="item__save--btn"><i class="material-icons">save</i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMStrings.expList;
                html =
                    '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__edit"><button class="item__edit--btn"><i class="material-icons">edit</i></button></div><div class="item__delete"><button class="item__delete--btn"><i class="material-icons">delete</i></button></div><div class="item__save"><button class="item__save--btn"><i class="material-icons">save</i></button></div></div></div>';
            }

            // Replace placeholder with data
            html = html.replace("%id%", budgetItem.id);
            html = html.replace("%description%", budgetItem.description);
            html = html.replace(
                "%value%",
                formatNumber(budgetItem.value, type)
            );

            // Insert HTML into the DOM
            document
                .querySelector(element)
                .insertAdjacentHTML("beforeend", html);

            // Style item box
            // Display or remove Edit and Delete buttons on mouse event
            UIItem = document.getElementById(type + "-" + budgetItem.id);
            UIItem.addEventListener("mouseover", displayButtons);
            UIItem.addEventListener("mouseout", removeButtons);
        },

        // Edit existing inputs
        editItem: function (selectorID, type, value) {
            var item;

            // Get item
            item = document.getElementById(selectorID);

            // Allaw edits
            item.querySelector(DOMStrings.itemDescription).setAttribute(
                "contenteditable",
                true
            );
            item.querySelector(DOMStrings.itemValue).setAttribute(
                "contenteditable",
                true
            );

            item.querySelector(DOMStrings.itemDescription).addEventListener(
                "keydown",
                controlEditInput
            );
            item.querySelector(DOMStrings.itemValue).addEventListener(
                "keydown",
                controlEditInput
            );

            // Add Save button
            item.querySelector(DOMStrings.btnSave).style.display = "block";

            // Remove percentage
            if (type === "exp") {
                item.querySelector(DOMStrings.itemPercentage).style.display =
                    "none";
            }

            // Remove Edit and Delete buttons
            item.querySelector(DOMStrings.btnDelete).style.display = "none";
            item.querySelector(DOMStrings.btnEdit).style.display = "none";

            // Remove mouse event
            item.removeEventListener("mouseover", displayButtons);
            item.removeEventListener("mouseout", removeButtons);

            // Display unformated value
            item.querySelector(DOMStrings.itemValue).innerHTML = value;
        },

        // Get user's edits
        getEdit: function (selectorID) {
            var item;

            // Get item
            item = document.getElementById(selectorID);

            return {
                value: item.querySelector(DOMStrings.itemValue).innerHTML,
                description: item.querySelector(DOMStrings.itemDescription)
                    .innerHTML,
            };
        },

        // Save edits
        saveItemEdits: function (selectorID, type, value) {
            var item;

            // Get item
            item = document.getElementById(selectorID);

            // Block edits
            item.querySelector(DOMStrings.itemDescription).setAttribute(
                "contenteditable",
                false
            );
            item.querySelector(DOMStrings.itemValue).setAttribute(
                "contenteditable",
                false
            );

            // Remove Save button
            item.querySelector(DOMStrings.btnSave).style.display = "none";

            // Display percentage
            if (type === "exp") {
                item.querySelector(DOMStrings.itemPercentage).style.display =
                    "block";
            }

            // Display or remove Edit and Delete buttons on mouse event
            item.addEventListener("mouseover", displayButtons);
            item.addEventListener("mouseout", removeButtons);

            // Formating and displaying value
            item.querySelector(DOMStrings.itemValue).innerHTML = formatNumber(
                value,
                type
            );
        },

        // Delete item
        deleteItem: function (selectorID) {
            var item = document.getElementById(selectorID);

            item.parentNode.removeChild(item);
        },

        // Add budget to UI
        updateBudget: function (obj) {
            var type;

            document.querySelector(DOMStrings.incValue).textContent =
                formatNumber(obj.inc, "inc");
            document.querySelector(DOMStrings.expValue).textContent =
                formatNumber(obj.exp, "exp");

            obj.budget < 0 ? (type = "exp") : (type = "inc");
            document.querySelector(DOMStrings.budgetValue).textContent =
                formatNumber(obj.budget, type);

            if (obj.inc > 0) {
                document.querySelector(DOMStrings.expPercentage).textContent =
                    obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.expPercentage).textContent =
                    "%";
            }
        },

        // Update percentages
        updatePercentages: function (percentages) {
            for (var i = 0; i < percentages.length; i++) {
                if (percentages[i] > 0) {
                    document.querySelectorAll(DOMStrings.itemPercentage)[
                        i
                    ].textContent = percentages[i] + "%";
                } else {
                    document.querySelectorAll(DOMStrings.itemPercentage)[
                        i
                    ].textContent = "%";
                }
            }
        },

        // Set up date
        updateDate: function () {
            var date, month, months, year;

            date = new Date();

            month = date.getMonth();
            months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];

            year = date.getFullYear();

            document.querySelector(DOMStrings.date).textContent =
                months[month] + " " + year;
        },

        // Change input fields if type was changed
        changedType: function () {
            var fields, button;

            fields = document.querySelectorAll(
                DOMStrings.type +
                    "," +
                    DOMStrings.description +
                    "," +
                    DOMStrings.value
            );

            button = document.querySelector(DOMStrings.addButton);

            // Change color of fields' borders and button
            fields.forEach(function (cur) {
                cur.classList.toggle("red-focus");
            });

            button.classList.toggle("red");
        },

        getDOMStrings: function () {
            return DOMStrings;
        },
    };
})();

// CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    var setEventListeners = function () {
        var DOM = UICtrl.getDOMStrings();
        // Add event handelers
        document
            .querySelector(DOM.addButton)
            .addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document
            .querySelector(DOM.container)
            .addEventListener("click", function (event) {
                // Find triggered button
                var button = event.target.parentNode.className;

                if (button === DOM.btnEditString) {
                    ctrlEditItem(event); // Edit item if edit button was triggered
                } else if (button === DOM.btnSaveString) {
                    ctrlSaveItemEdits(event); // Save item edits if save button was triggered
                } else if (button === DOM.btnDeleteString) {
                    ctrlDeleteItem(event); // Delete item if delete button was triggered
                }
            });

        document
            .querySelector(DOM.type)
            .addEventListener("change", UICtrl.changedType);
    };

    var updateBudget = function () {
        var get;
        // Calculate budget
        budgetCtrl.updateBudget();

        // Return budget
        get = budgetCtrl.get();

        // Add budget to UI
        UICtrl.updateBudget(get);
    };

    updatePercentages = function () {
        var percentages;

        // Update percentage for each expense
        budgetCtrl.updatePercentages();

        // Save all percentages
        percentages = budgetCtrl.getPercentages();

        // Add individual item's percentages to the UI
        UICtrl.updatePercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        // Get input value
        input = UICtrl.getInput();

        if (
            input.description !== "" &&
            !isNaN(input.value) &&
            input.value > 0
        ) {
            // Add the new item to the internal  data structure
            newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );

            // Add a new item to the UI
            UICtrl.addItem(newItem, input.type);

            // Update and display budget
            updateBudget();

            // Update and display percentages
            updatePercentages();

            // Clear input fields
            UICtrl.clearFields();
        }
    };

    var ctrlEditItem = function (event) {
        var itemID, splitID, type, ID, input;

        // Find Id
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // Split ID but only when right button is clicked
        splitID = itemID.split("-");
        type = splitID[0];
        ID = parseInt(splitID[1]);

        input = budgetCtrl.getItemValue(type, ID);

        UICtrl.editItem(itemID, type, input);
    };

    var ctrlSaveItemEdits = function (event) {
        var itemID, splitID, type, ID, value, description;

        // Find Id
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // Split ID but only when right button is clicked
        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Get user's edits
            value = parseInt(UICtrl.getEdit(itemID).value);
            description = UICtrl.getEdit(itemID).description;

            if (description !== "" && !isNaN(value) && value > 0) {
                // Save item edits in budget controller
                budgetCtrl.saveItemEdits(description, value, type, ID);

                // Save item edits in UI
                UICtrl.saveItemEdits(itemID, type, value);

                // Update Budget and UI
                updateBudget();

                // Update and display percentages
                updatePercentages();
            }
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        // Find Id
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // Split ID but only when right button is clicked
        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete item from budget controller
            budgetCtrl.deleteItem(type, ID);

            // Delete item from UI
            UICtrl.deleteItem(itemID);

            // Update Budget and UI
            updateBudget();

            // Update and display percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            UICtrl.updateDate();
            updateBudget();
            setEventListeners();
        },
    };
})(budgetController, UIController);

controller.init();
