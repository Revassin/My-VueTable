new Vue({
    el: '#app',
    data: {
        /////////////////////// Table ///////////////////////////
        sortKey: '',
        tableHeader: ["id", "name", "race"],
        sortOrder: 1,
        sortOrders: {},
        editable: null,
        totalCount: [],
        tableData: [],
        /////////////////////// Checkboxes ///////////////////////////
        selectedRows: [],
        Allselected: false,
        /////////////////////// Search/Filter ///////////////////////////
        searchQuery: '',
        columnFilter: ['name'],
        /////////////////////// Pagination ///////////////////////////
        currentPage: 0,
        itemsPerPage: 5,
        startOffset: null,
        options: [
            { text: '5', value: '5' },
            { text: '10', value: '10' },
            { text: '25', value: '25' }
        ],
        resultCount: 0
  },
    methods: {
        sortBy (key) {
            var vm = this;
            vm.sortKey = key;
            vm.sortOrder = this.sortOrder * -1;
            //   this.sortOrders[key] = this.sortOrders[key] * -1;
        },
        selectAll () {
            var vm = this;
            if (!vm.Allselected) {
                vm.selectedRows = [];
                // Note to Self: A forEach anonymous functie doesnt work with THIS so use the follwing instead: (value) => {}
                vm.tableData.forEach((row, index) => {
                    vm.selectedRows.push(row.id);
                });

            } else if (vm.Allselected) {
                vm.selectedRows = [];
            }
          },
        selectRow () {
            var vm = this;
            vm.Allselected = false;
        },
        editRow (index) {
            var vm = this;
            // Resets the edit value
            vm.editable = null;
            // Gets the new edit value
            vm.editable = index;
        },
        // Pagination functie
        setPage: function(pageNumber) {
            var vm = this;
              vm.currentPage = pageNumber
              vm.startOffset = this.currentPage * this.itemsPerPage;
              vm.getTotalCount();
              vm.getData();
        },
        // Ajax requests ////////////////////////////////////////////////////////////////////
        getData () {
            var vm = this;

            $.ajax({
              method: 'GET',
              dataType: 'json',
              async: false,
              url: 'http://localhost:3000/posts?_start=' + vm.startOffset + '&_limit=' + vm.itemsPerPage,
            })
            .done((data) => {
                vm.$set('tableData', data);
            }).fail(() => {
                alert('An Error occured during data retrieval');
            });
        },
        addRow () {
            var vm = this;

            $.ajax({
              method: 'POST',
              dataType: 'json',
              url: 'http://localhost:3000/posts/',
              data: {id: null , name: "", race: ""}
            })
            .done((msg) => {
                console.log(msg);
                vm.setPage();
            }).fail((msg) => {
                alert( 'An Error occured during data retrieval');
            });
        },
        saveRow (index) {
            var vm = this;
            vm.editable = null;
            var row = vm.tableData.slice(index,index+1);

            $.ajax({
              method: 'PUT',
              dataType: 'json',
              url: 'http://localhost:3000/posts/' + row[0].id,
              data: row[0]
            })
            .done((msg) => {
                // console.log(msg);
                vm.getData();
            }).fail((msg) => {
                alert( 'An Error occured during data retrieval');
            });
        },
        removeRow (row) {
            var vm = this;

            if (confirm( 'Are you sure you want to delete this row?')) {
                // Verwijdert de geselecteerde row
                vm.tableData.$remove(row);

                $.ajax({
                  method: 'DELETE',
                  dataType: 'json',
                  url: 'http://localhost:3000/posts/' + row.id,
                })
                .done((msg) => {
                    // console.log('deleted: ' + JSON.stringify(msg));
                    vm.getTotalCount();
                    vm.getData();
                }).fail((msg) => {
                    alert('An Error occured during data retrieval');
                });
            }
        },
        removeSelected () {
            var vm = this;
            if (confirm( 'Do you want to delete the selected files?')) {
                vm.selectedRows.forEach((id) => {
                    $.ajax({
                      method: 'DELETE',
                      dataType: 'json',
                      url: 'http://localhost:3000/posts/' + id,
                    })
                    .done((msg) => {
                        // console.log('deleted: ' + JSON.stringify(msg));
                        vm.getTotalCount();
                        vm.getData();
                        vm.selectedRows = []; // Haalt de voormalige geselecteerde id er uit
                    }).fail((msg) => {
                        alert('An Error occured during data retrieval');
                    });
                })
            }
        },
        getTotalCount () {
            var vm = this;

            $.ajax({
              method: 'GET',
              dataType: 'json',
              async: false,
              url: 'http://localhost:3000/posts',
            })
            .done((data) => {
                vm.$set('totalCount', data);
            }).fail(() => {
                alert('An Error occured during data retrieval');
            });
        },
        // Resets the table if empty
        pageBack () {
            var vm = this;
            if (vm.tableData.length <= 0) {
                console.log("Uitgevoerd");
                vm.currentPage = vm.totalPages - 1
                vm.getData();
            }
        }
    },
    // Sort Orders (werkt op moment niet)
    created: function () {
        var vm = this;
        vm.getTotalCount();
        vm.getData();
        // Hier wordt binnen het object sortOrders de per header (id,name,race) de nummer 1 toegewezen
        // this.tableHeader.forEach((header) => {
            // this.sortOrders[header] = 1; // Check of ik dit kan setten (via vuejs)?
            // console.log(this.sortOrders);
        // })
    },
    // Pagination (alles hieronder)
    computed: {
        totalPages: function() {
            var vm = this;
            return Math.ceil(vm.totalCount.length / vm.itemsPerPage)
        }
    }
});
