require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageryLayer",
  "esri/layers/GroupLayer",
  "esri/widgets/LayerList",
  "esri/widgets/Home",
  "esri/widgets/Legend",
  "esri/layers/support/LabelClass",
  "esri/PopupTemplate",
  "esri/widgets/Expand",
  "esri/widgets/Print",
  "esri/Basemap",
  "esri/widgets/BasemapGallery",
  "esri/widgets/ScaleBar",
  "esri/widgets/Compass",
  "esri/widgets/Print"
], function(Map, MapView, MapImageLayer, FeatureLayer, ImageryLayer,
  GroupLayer, LayerList, Home, Legend, LabelClass, 
  PopupTemplate, Expand, Print, Basemap, BasemapGallery, ScaleBar, Compass, Print) {

    const resultDivPanel = document.getElementById("resultDivPanel");
    const layerTitleElement = document.getElementById("layerTitle");
    const tableView = document.getElementById("tableContainer");
    const chartView = document.getElementById("chartContainer");
    const tableRadio = document.getElementById("tableView");
    const chartRadio = document.getElementById("chartView");
    let myChart; // For Chart.js instance

    // Dummy data for demonstration
    const dummySensorData = [
      { date: "2025-01-01", Name: 15.2, Place: 12.5, Thing: 8 },
      { date: "2025-02-02", Name: 16.1, Place: 13.0, Thing: 7 },
      { date: "2025-03-03", Name: 15.8, Place: 12.8, Thing: 8 },
      { date: "2025-04-04", Name: 15.5, Place: 12.2, Thing: 9 },
      { date: "2025-05-05", Name: 16.5, Place: 13.1, Thing: 7 },
      { date: "2025-06-06", Name: 17.0, Place: 13.5, Thing: 6 },
      { date: "2025-07-07", Name: 17.2, Place: 13.8, Thing: 6 },
      { date: "2025-08-08", Name: 16.8, Place: 13.4, Thing: 7 },
      { date: "2025-09-09", Name: 16.0, Place: 13.0, Thing: 8 },
      { date: "2025-10-10", Name: 15.4, Place: 12.7, Thing: 9 },
      { date: "2025-11-11", Name: 15.0, Place: 12.4, Thing: 9 },
      { date: "2025-12-12", Name: 14.8, Place: 12.0, Thing: 10 },
      { date: "2026-01-13", Name: 15.1, Place: 12.3, Thing: 9 },
    ];
    const itemsPerPage = 5;
    let currentPage = 1;

    function createTable(data, page) {
      const table = document.createElement("table");
      const header = document.createElement("tr");
      Object.keys(data[0]).forEach(key => {
        const th = document.createElement("th");
        th.textContent = key.toUpperCase();
        header.appendChild(th);
      });
      table.appendChild(header);

      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedData = data.slice(start, end);

      paginatedData.forEach(row => {
        const tr = document.createElement("tr");
        Object.values(row).forEach(value => {
          const td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });

      tableView.innerHTML = '';
      tableView.appendChild(table);
      createPagination(data.length, page);
    }

    function createPagination(totalItems, page) {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const paginationDiv = document.createElement("div");
      paginationDiv.classList.add("pagination");

      const prevBtn = document.createElement("button");
      prevBtn.textContent = "Previous";
      prevBtn.disabled = page === 1;
      prevBtn.onclick = () => {
        currentPage--;
        createTable(dummySensorData, currentPage);
      };
      paginationDiv.appendChild(prevBtn);

      const nextBtn = document.createElement("button");
      nextBtn.textContent = "Next";
      nextBtn.disabled = page === totalPages;
      nextBtn.onclick = () => {
        currentPage++;
        createTable(dummySensorData, currentPage);
      };
      paginationDiv.appendChild(nextBtn);

      tableView.appendChild(paginationDiv);
    }

    function createChart() {
      const canvas = document.createElement('canvas');
      canvas.id = 'myChart';
      chartView.innerHTML = '';
      chartView.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (myChart) {
        myChart.destroy();
      }
      myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dummySensorData.map(d => d.date),
          datasets: [
            {
              label: 'Name',
              data: dummySensorData.map(d => d.Name),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            },
            {
              label: 'Place',
              data: dummySensorData.map(d => d.Place),
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1
            },
            {
              label: 'Thing',
              data: dummySensorData.map(d => d.Thing),
              borderColor: 'rgb(54, 162, 235)',
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }

    tableRadio.addEventListener('change', () => {
      if (tableRadio.checked) {
        tableView.style.display = 'block';
        chartView.style.display = 'none';
        createTable(dummySensorData, currentPage);
      }
    });

    chartRadio.addEventListener('change', () => {
      if (chartRadio.checked) {
        tableView.style.display = 'none';
        chartView.style.display = 'block';
        createChart();
      }
    });

    // Helper function to create a dynamic popup template
    function createPopupTemplate(layer, fieldInfos) {
      layer.popupTemplate = new PopupTemplate({
        title: layer.title,
        content: [{
          type: "fields",
          fieldInfos: fieldInfos
        }]
      });
    }

    // Helper function to create the legend widget
    let legendWidget = null;
    function createLegendWidget(view, layer) {
        if (!legendWidget) {
            legendWidget = new Legend({
                view: view,
                layerInfos: []
            });
            view.ui.add(legendWidget, "bottom-right");
        }

        const isCurrentlyShowing = legendWidget.layerInfos.some(info => info.layer === layer);

        if (isCurrentlyShowing && legendWidget.visible) {
            legendWidget.visible = false;
        } else {
            legendWidget.layerInfos = [{
                layer: layer,
                title: layer.title
            }];
            legendWidget.visible = true;
        }
    }

    // Label class for "Labels" action
    // const labelClass = new LabelClass({
    //   symbol: {
    //     type: "text", // autocasts as new TextSymbol()
    //     color: "black",
    //     haloColor: "white",
    //     haloSize: 1.5,
    //     font: {
    //       family: "Noto Sans",
    //       size: 10,
    //     },
    //   },
    //   labelPlacement: "above-center",
    //   labelExpressionInfo: {
    //     expression: "$feature.Name || $feature.Zone || $feature.Circle",
    //   },
    // });

    // // Helper function to toggle labels
    // function setLabels(layer) {
    //   layer.labelsVisible = !layer.labelsVisible;
    // }

    // Helper function to create and append the Calcite slider
    function createOpacitySlider(item) {
      const label = document.createElement("calcite-label");
      label.innerText = "Opacity";
      label.scale = "s";

      const slider = document.createElement("calcite-slider");
      slider.labelHandles = true;
      slider.labelTicks = true;
      slider.min = 0;
      slider.minLabel = "0";
      slider.max = 1;
      slider.maxLabel = "1";
      slider.scale = "s";
      slider.step = 0.01;
      slider.value = item.layer.opacity;

      slider.addEventListener("calciteSliderChange", () => {
        item.layer.opacity = slider.value;
      });

      label.appendChild(slider);
      return label;
    }

    let expand = null;

    // A function that executes each time a ListItem is created for a layer.
    function setLayerListActions(event) {
      const item = event.item;
      const layer = item.layer;

      // Custom panel to hold the buttons \\\\\\\\\\\\\\
      const panelContent = document.createElement("div");
      panelContent.classList.add("btn-group");

      // "Locate" button \\\\\\\\\\\\\\\\\\\
      const locateBtn = document.createElement("calcite-button");
      locateBtn.innerText = "Locate";
      locateBtn.icon = "layer-zoom-to";
      locateBtn.title = "Zoom to";
      //////////////// \\\\\\\\\\\\\\\\\\\\\\\\\\\\
      locateBtn.onclick = () => {
        // Show the results panel and update its title
        expand.expand();
        layerTitleElement.innerText = layer.title;

        // Zoom to the layer's full extent
        view.goTo(layer.fullExtent).catch((error) => {
          if (error.name !== "AbortError") {
            console.error(error);
          }
        });

        // Trigger table view by default
        tableRadio.checked = true;
        chartRadio.checked = false;
        tableView.style.display = 'block';
        chartView.style.display = 'none';
        currentPage = 1;
        createTable(dummySensorData, currentPage);
      };
      panelContent.appendChild(locateBtn);
      
      // "Labels" button \\\\\\\\\\\\\\\\\\\\\\\\\\\\
      // const labelsBtn = document.createElement("calcite-button");
      // labelsBtn.innerText = "Labels";
      // labelsBtn.icon = "text-bubble";
      // labelsBtn.title = "Toggle labels";
      // labelsBtn.onclick = () => {
      //   setLabels(layer);
      // };
      // panelContent.appendChild(labelsBtn);
      
      // "Legend" button \\\\\\\\\\\\\\\\\\\\\\\\\\\\
      const legendBtn = document.createElement("calcite-button");
      legendBtn.innerText = "Legend";
      legendBtn.icon = "legend";
      legendBtn.title = "Toggle legend";
      legendBtn.onclick = () => {
        createLegendWidget(view, layer);
      };
      panelContent.appendChild(legendBtn);

      // Opacity slider panel \\\\\\\\\\\\\\\\\\\\\\\\\\\\
      const opacitySlider = createOpacitySlider(item);
      panelContent.appendChild(opacitySlider);

      item.panel = {
        content: panelContent,
        icon: "ellipsis-circle",
        //open: true,
        title: "Layer Actions"
      };
      //~~~~~~~~~
    }

    

    // ~~~~~~~~~ DEFINE LAYERS ~~~~~~~~~~~~~~
    // Typical usage
    const usaLULC = new ImageryLayer({
      // URL to the imagery service
      url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/NLCDLandCover2001/ImageServer",
      title: "National Land Cover Database (NLCD) 2001 - Land Cover Classification",
      visible: true,
      legendEnabled: true,
      format: "jpgpng" // server exports in either jpg or png format
    });

    const AirportsGroup = new GroupLayer({
      title: "USA Airports by Scale",
      visible: true,
      layers: [                        
        new FeatureLayer({
          url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer/10",
          title: "Balloonport",
          visible: false,
          outFields: ["*"]
        }),
        new FeatureLayer({
          url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer/9",
          title: "Ultralight",
          visible: false,
          outFields: ["*"]
        }),        
        new FeatureLayer({
          url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer/8",
          title: "Gliderport",
          visible: false,
          outFields: ["*"]
        }),
        new FeatureLayer({
          url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer/7",
          title: "Seaplane Base",
          visible: false,
          outFields: ["*"]
        }),
        new FeatureLayer({
          url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer/6",
          title: "Heliport",
          visible: false,
          outFields: ["*"]
        }),
        new FeatureLayer({
          url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer/4",
          title: "Unknown (Airport)",
          visible: false,
          outFields: ["*"]
        }),
        new FeatureLayer({
          url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer/3",
          title: "Less than 100,000",
          visible: false,
          outFields: ["*"]
        }),
        new FeatureLayer({
          url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer/2",
          title: "100,000 - 999,999",
          visible: false,
          outFields: ["*"]
        }),
        new FeatureLayer({
          url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer/1",
          title: "1,000,000 or more",
          visible: true,
          outFields: ["*"]
        })
      ]
    });
    ////////////////////////////////////////////////////////////////
    
    // ~~~~~~~~~~~ DEFINE POP-UP TEMPLATES ~~~~~~~~~~~~~~~~
    createPopupTemplate(AirportsGroup.layers.getItemAt(0), [
      { fieldName: "NAME", label: "Name" },
      { fieldName: "FACILITY", label: "Facility" },
      { fieldName: "CITY", label: "City" },
      { fieldName: "COUNTY", label: "County" },
      { fieldName: "STATE", label: "State" },
      { fieldName: "FAA_ID", label: "FAA Id" }
    ]);
    createPopupTemplate(AirportsGroup.layers.getItemAt(1), [
      { fieldName: "NAME", label: "Name" },
      { fieldName: "FACILITY", label: "Facility" },
      { fieldName: "CITY", label: "City" },
      { fieldName: "COUNTY", label: "County" },
      { fieldName: "STATE", label: "State" },
      { fieldName: "FAA_ID", label: "FAA Id" }
    ]);
    createPopupTemplate(AirportsGroup.layers.getItemAt(2), [
      { fieldName: "NAME", label: "Name" },
      { fieldName: "FACILITY", label: "Facility" },
      { fieldName: "CITY", label: "City" },
      { fieldName: "COUNTY", label: "County" },
      { fieldName: "STATE", label: "State" },
      { fieldName: "FAA_ID", label: "FAA Id" }
    ]);
    createPopupTemplate(AirportsGroup.layers.getItemAt(3), [
      { fieldName: "NAME", label: "Name" },
      { fieldName: "FACILITY", label: "Facility" },
      { fieldName: "CITY", label: "City" },
      { fieldName: "COUNTY", label: "County" },
      { fieldName: "STATE", label: "State" },
      { fieldName: "FAA_ID", label: "FAA Id" }
    ]);
    createPopupTemplate(AirportsGroup.layers.getItemAt(4), [
      { fieldName: "NAME", label: "Name" },
      { fieldName: "FACILITY", label: "Facility" },
      { fieldName: "CITY", label: "City" },
      { fieldName: "COUNTY", label: "County" },
      { fieldName: "STATE", label: "State" },
      { fieldName: "FAA_ID", label: "FAA Id" }
    ]);
    createPopupTemplate(AirportsGroup.layers.getItemAt(5), [
      { fieldName: "NAME", label: "Name" },
      { fieldName: "FACILITY", label: "Facility" },
      { fieldName: "CITY", label: "City" },
      { fieldName: "COUNTY", label: "County" },
      { fieldName: "STATE", label: "State" },
      { fieldName: "FAA_ID", label: "FAA Id" }
    ]);
    createPopupTemplate(AirportsGroup.layers.getItemAt(6), [
      { fieldName: "NAME", label: "Name" },
      { fieldName: "FACILITY", label: "Facility" },
      { fieldName: "CITY", label: "City" },
      { fieldName: "COUNTY", label: "County" },
      { fieldName: "STATE", label: "State" },
      { fieldName: "FAA_ID", label: "FAA Id" }
    ]);
    createPopupTemplate(AirportsGroup.layers.getItemAt(7), [
      { fieldName: "NAME", label: "Name" },
      { fieldName: "FACILITY", label: "Facility" },
      { fieldName: "CITY", label: "City" },
      { fieldName: "COUNTY", label: "County" },
      { fieldName: "STATE", label: "State" },
      { fieldName: "FAA_ID", label: "FAA Id" }
    ]);
    createPopupTemplate(AirportsGroup.layers.getItemAt(8), [
      { fieldName: "NAME", label: "Name" },
      { fieldName: "FACILITY", label: "Facility" },
      { fieldName: "CITY", label: "City" },
      { fieldName: "COUNTY", label: "County" },
      { fieldName: "STATE", label: "State" },
      { fieldName: "FAA_ID", label: "FAA Id" }
    ]);
    
    ////////////////////////////////////////////////////////////////

    // Create a new Map with the defined layers
    const map = new Map({
      basemap: "satellite",
      layers: [
        usaLULC, AirportsGroup
      ]
    });

    // Create the MapView
    const view = new MapView({
      container: "mapviewDiv",
      map: map,
      center: [-100, 38], // Longitude, latitude
      zoom: 5
    });

    // Add Home and LayerList widgets
    view.ui.add(new Home({ view: view }), "top-trailing");
    view.ui.move("navigation-toggle", "top-right");
    view.ui.move("zoom", "top-trailing");
    view.ui.add("logoDiv", "bottom-leading");

    const basemapGallery = new BasemapGallery({
      view: view
      });

      let expandBG = new Expand({
        view: view,
        content: basemapGallery,
        expandIcon: "basemap",
        group: "bottom-right"
      });
      view.ui.add(expandBG, "bottom-right");

    view.when(() => {
      const layerList = new LayerList({
        view: view,
        position: "top-leading",
        visibleElements: {
        filter: true,
        heading: true,
        headingLevel: 3,
        collapseButton: true
        },
        filterPlaceholder: "Filter layers",
        listItemCreatedFunction: setLayerListActions,
        dragEnabled: false
      });
      view.ui.add(layerList, "top-leading");

      // Open the first GroupLayer by default
      layerList.when(() => {
        const firstGroupLayerItem = layerList.operationalItems.find(item => item.layer.type === 'group');
        if (firstGroupLayerItem) {
          firstGroupLayerItem.open = true;
        }
      });

      expand = new Expand({
        view: view,
        content: resultDivPanel,
        expandIcon: "graph-line-series",
        group: "top-right",
      });
      view.ui.add(expand, "top-right");

    });

    const scaleBar = new ScaleBar({
        view: view,
        style: "line",
          unit: "metric"
      });

      const scaleBarExpand = new Expand({
          view: view,
          content: scaleBar,
          expandIcon: "measure-line"
      });
      view.ui.add(scaleBarExpand, "bottom-left");

      const compassWidget = new Compass({
        view: view,
        });

      // Add the Compass widget to the top left corner of the view
      view.ui.add(compassWidget, "top-right");

});