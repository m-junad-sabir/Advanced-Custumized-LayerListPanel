require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer",
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
  "esri/widgets/Compass"
], function(Map, MapView, MapImageLayer, FeatureLayer, 
  GroupLayer, LayerList, Home, Legend, LabelClass, 
  PopupTemplate, Expand, Print, Basemap, BasemapGallery, ScaleBar, Compass) {

    const resultDivPanel = document.getElementById("resultDivPanel");
    const layerTitleElement = document.getElementById("layerTitle");
    const tableView = document.getElementById("tableContainer");
    const chartView = document.getElementById("chartContainer");
    const tableRadio = document.getElementById("tableView");
    const chartRadio = document.getElementById("chartView");
    let myChart; // For Chart.js instance

    // Dummy data for demonstration
    const dummySensorData = [
      { date: "2023-01-01", gauge1: 15.2, gauge2: 12.5, gate: 8 },
      { date: "2023-01-02", gauge1: 16.1, gauge2: 13.0, gate: 7 },
      { date: "2023-01-03", gauge1: 15.8, gauge2: 12.8, gate: 8 },
      { date: "2023-01-04", gauge1: 15.5, gauge2: 12.2, gate: 9 },
      { date: "2023-01-05", gauge1: 16.5, gauge2: 13.1, gate: 7 },
      { date: "2023-01-06", gauge1: 17.0, gauge2: 13.5, gate: 6 },
      { date: "2023-01-07", gauge1: 17.2, gauge2: 13.8, gate: 6 },
      { date: "2023-01-08", gauge1: 16.8, gauge2: 13.4, gate: 7 },
      { date: "2023-01-09", gauge1: 16.0, gauge2: 13.0, gate: 8 },
      { date: "2023-01-10", gauge1: 15.4, gauge2: 12.7, gate: 9 },
      { date: "2023-01-11", gauge1: 15.0, gauge2: 12.4, gate: 9 },
      { date: "2023-01-12", gauge1: 14.8, gauge2: 12.0, gate: 10 },
      { date: "2023-01-13", gauge1: 15.1, gauge2: 12.3, gate: 9 },
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
              label: 'Gauge 1',
              data: dummySensorData.map(d => d.gauge1),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            },
            {
              label: 'Gauge 2',
              data: dummySensorData.map(d => d.gauge2),
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1
            },
            {
              label: 'Gate',
              data: dummySensorData.map(d => d.gate),
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
    const labelClass = new LabelClass({
      symbol: {
        type: "text", // autocasts as new TextSymbol()
        color: "black",
        haloColor: "white",
        haloSize: 1.5,
        font: {
          family: "Noto Sans",
          size: 10,
        },
      },
      labelPlacement: "above-center",
      labelExpressionInfo: {
        expression: "$feature.Name || $feature.Zone || $feature.Circle",
      },
    });

    // Helper function to toggle labels
    function setLabels(layer) {
      layer.labelsVisible = !layer.labelsVisible;
    }

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
    const layer1 = new FeatureLayer({
      url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/1",
      title: "CJ Link Gauges",
      visible: true,
      outFields: ["*"]
    });
    const layer2 = new FeatureLayer({
      url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/2",
      title: "Chashma Gauges",
      visible: true,
      outFields: ["*"]
    });
    const layer3 = new FeatureLayer({
      url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/3",
      title: "Chasma",
      visible: true,
      outFields: ["*"]
    });
    const ChashmaBarrageGroup = new GroupLayer({
      title: "Chashma Barrage",
      visible: true,
      layers: [
        layer1,
        layer2,
        layer3
      ]
    });
    ////////////////////////////////////////////////////////////////
    const layer33 = new FeatureLayer({
      url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/33",
      title: "Sulemanki Headworks Gauges",
      visible: false,
      outFields: ["*"]
    });
    const layer34 = new FeatureLayer({
      url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/34",
      title: "Suleimanki Headworks",
      visible: false,
      outFields: ["*"]
    });
    const SulemankiHeadworksGroup = new GroupLayer({
      title: "Sulemanki Headworks",
      visible: false,
      layers: [
        layer33,
        layer34
      ]
    });
    ////////////////////////////////////////////////////////////////
    const layer36 = new FeatureLayer({
      url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/36",
      title: "Balloki Gauges",
      visible: false,
      outFields: ["*"]
    });
    const layer37 = new FeatureLayer({
      url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/37",
      title: "Balloki",
      visible: false,
      outFields: ["*"]
    });
    const BallokiHeadworksGroup = new GroupLayer({
      title: "Balloki Headworks",
      visible: false,
      layers: [
        layer36,
        layer37
      ]
    });
    ////////////////////////////////////////////////////////////////
    const layer42 = new FeatureLayer({
      url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/42",
      title: "Trimmu Gauges",
      visible: false,
      outFields: ["*"]
    });
    const layer43 = new FeatureLayer({
      url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/43",
      title: "Trimmu",
      visible: false,
      outFields: ["*"]
    });
    const TrimmuHeadworksGroup = new GroupLayer({
      title: "Trimmu Headworks",
      visible: false,
      layers: [
        layer42,
        layer43
      ]
    });
    ////////////////////////////////////////////////////////////////
    const BigGroup = new GroupLayer({

        url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/84",
        title: "Boundary Layers",
        visible: true,
        layers: [
            new FeatureLayer({
                url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/85",
                title: "Irrigation Network",
                visible: false,
                outFields: ["*"]
            }),
            new FeatureLayer({
                url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/86",
                title: "Line of Control (LOC)",
                visible: true,
                outFields: ["*"]
            }),
            new FeatureLayer({
                url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/87",
                title: "Major Cities",
                visible: true,
                outFields: ["*"]
            }),
            new FeatureLayer({
                url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/88",
                title: "River Network",
                visible: true,
                outFields: ["*"]
            }),
            new FeatureLayer({
                url: "https://113.197.48.2:6443/arcgis/rest/services/Bak/Layers/MapServer/89",
                title: "Provincial Boundary",
                visible: true,
                outFields: ["*"]
            })
        ]
    });
    ///////////////////////////////////////////////////////////////

    // ~~~~~~~~~~~ DEFINE POP-UP TEMPLATES ~~~~~~~~~~~~~~~~
    createPopupTemplate(ChashmaBarrageGroup.layers.getItemAt(0), [
      { fieldName: "Name", label: "Name" },
      { fieldName: "Layer", label: "Layer" },
      { fieldName: "Site_Id", label: "Site_Id" },
      { fieldName: "Site", label: "Site" }
    ]);
    createPopupTemplate(ChashmaBarrageGroup.layers.getItemAt(1), [
      { fieldName: "Name", label: "Name" },
      { fieldName: "Layer", label: "Layer" },
      { fieldName: "Site_Id", label: "Site_Id" },
      { fieldName: "Site", label: "Site" }
    ]);
    createPopupTemplate(ChashmaBarrageGroup.layers.getItemAt(2), [
      { fieldName: "Name", label: "Name" },
      { fieldName: "Layer", label: "Layer" },
      { fieldName: "Site_Id", label: "Site_Id" },
      { fieldName: "Site", label: "Site" }
    ]);
    ////////////////////////////////////////////////////////////////
    createPopupTemplate(SulemankiHeadworksGroup.layers.getItemAt(0), [
      { fieldName: "Name", label: "Name" },
      { fieldName: "Layer", label: "Layer" },
      { fieldName: "Site_Id", label: "Site_Id" },
      { fieldName: "Site", label: "Site" }
    ]);
    createPopupTemplate(SulemankiHeadworksGroup.layers.getItemAt(1), [
      { fieldName: "Name", label: "Name" },
      { fieldName: "Layer", label: "Layer" },
      { fieldName: "Site_Id", label: "Site_Id" },
      { fieldName: "Site", label: "Site" }
    ]);
    ////////////////////////////////////////////////////////////////
    createPopupTemplate(BallokiHeadworksGroup.layers.getItemAt(0), [
      { fieldName: "Name", label: "Name" },
      { fieldName: "Layer", label: "Layer" },
      { fieldName: "Site_Id", label: "Site_Id" },
      { fieldName: "Site", label: "Site" }
    ]);
    createPopupTemplate(BallokiHeadworksGroup.layers.getItemAt(1), [
      { fieldName: "Name", label: "Name" },
      { fieldName: "Layer", label: "Layer" },
      { fieldName: "Site_Id", label: "Site_Id" },
      { fieldName: "Site", label: "Site" }
    ]);
    ////////////////////////////////////////////////////////////////
    createPopupTemplate(TrimmuHeadworksGroup.layers.getItemAt(0), [
      { fieldName: "Name", label: "Name" },
      { fieldName: "Layer", label: "Layer" },
      { fieldName: "Site_Id", label: "Site_Id" },
      { fieldName: "Site", label: "Site" }
    ]);
    createPopupTemplate(TrimmuHeadworksGroup.layers.getItemAt(1), [
      { fieldName: "Name", label: "Name" },
      { fieldName: "Layer", label: "Layer" },
      { fieldName: "Site_Id", label: "Site_Id" },
      { fieldName: "Site", label: "Site" }
    ]);
    ////////////////////////////////////////////////////////////////
    createPopupTemplate(BigGroup.layers.getItemAt(0), [
        { fieldName: "CanalCode", label: "CanalCode" },
        { fieldName: "River", label: "River" },
        { fieldName: "CNLName", label: "CNLName" },
        { fieldName: "CCAName", label: "CCAName" },
        { fieldName: "CCACode", label: "CCACode" },
        { fieldName: "ACZCode", label: "ACZCode" },
        { fieldName: "ACZName", label: "ACZName" },
        { fieldName: "Province", label: "Province" },
        { fieldName: "Basin", label: "Basin" },
        { fieldName: "Doab", label: "Doab" },
        { fieldName: "Type", label: "Type" },
        { fieldName: "W_Type", label: "W_Type" },
        { fieldName: "Type_New", label: "Type_New" }
    ]);
    createPopupTemplate(BigGroup.layers.getItemAt(1), [
        { fieldName: "Name", label: "Name" },
        { fieldName: "Id", label: "Id" },
        { fieldName: "Lenght", label: "Lenght" }
        
    ]);
    createPopupTemplate(BigGroup.layers.getItemAt(2), [
        { fieldName: "name", label: "name" },
        { fieldName: "population", label: "population" },
        { fieldName: "type", label: "type" },
        { fieldName: "Sel", label: "Sel" },
        { fieldName: "osm_id", label: "osm_id" }
    ]);
    createPopupTemplate(BigGroup.layers.getItemAt(3), [
        { fieldName: "RiverName", label: "RiverName" },
        { fieldName: "Remarks", label: "Remarks" },
        { fieldName: "LenghtKM", label: "LenghtKM" }
    ]);
    createPopupTemplate(BigGroup.layers.getItemAt(4), [
        { fieldName: "Name_0", label: "Name" },
        { fieldName: "Name_1", label: "Name" },
        { fieldName: "VARNAME_1", label: "Var Name" },
        { fieldName: "NL_NAME_1", label: "NL Name" },
        { fieldName: "HASC_1", label: "hasc" },
        { fieldName: "CC_1", label: "cc" },
        { fieldName: "ENGTYPE_1", label: "eng name" },
        { fieldName: "REMARKS_1", label: "remarks" },
        { fieldName: "Shape_Area", label: "area" }
    ]);
    ////////////////////////////////////////////////////////////////

    // Create a new Map with the defined layers
    const map = new Map({
      basemap: "satellite",
      layers: [
        BigGroup,
        TrimmuHeadworksGroup,
        BallokiHeadworksGroup,
        SulemankiHeadworksGroup,
        ChashmaBarrageGroup
      ]
    });

    // Create the MapView
    const view = new MapView({
      container: "mapviewDiv",
      map: map,
      center: [68, 30.6],
      zoom: 6
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

    //     printServiceUrl: "https://113.197.48.2:6443/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"

});