import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Record } from 'src/app/shared/models/records';
import { DataService } from 'src/app/shared/services/dataservice';
import { SubCategory } from 'src/app/shared/models/subcategory';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_colombiaHigh from '@amcharts/amcharts4-geodata/colombiaHigh';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, AfterViewInit {

  public dataSelect: SubCategory[];
  public categoryTitle: String;
  public subcategoryTitle: String;

  public data: Record;
  public message: String;

  private category: String;
  private subcategory: String;
  private chart: any;
  private imageSeries: any;

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.category = 'A';
    this.categoryTitle = 'A';
    this.subcategoryTitle = `Ambiente`;
    this.fillSelectOptions('Ambiente');
  }

  ngAfterViewInit() {
    this.chart = am4core.create('mapCO', am4maps.MapChart);

    this.chart.geodata = am4geodata_colombiaHigh;
    this.chart.projection = new am4maps.projections.Miller();

    this.chart.zoomControl = new am4maps.ZoomControl();
    this.chart.zoomControl.zIndex = 10;

    const loadingLabel = this.chart.chartContainer.createChild(am4core.Label);
    loadingLabel.verticalCenter = 'middle';
    loadingLabel.y = am4core.percent(50);
    loadingLabel.dy = -10;
    loadingLabel.horizontalCenter = 'middle';
    loadingLabel.align = 'center';

    const colombiaSeries = this.chart.series.push(new am4maps.MapPolygonSeries());
    colombiaSeries.useGeodata = true;
    colombiaSeries.mapPolygons.template.events.on('hit', (ev) => {
      this.chart.zoomToMapObject(ev.target);
    });

    // tslint:disable-next-line:max-line-length
    colombiaSeries.geodataSource.url = 'https://gist.githubusercontent.com/notacouch/edbf796ff35ddd0bd0a0dc365660aa1f/raw/eb19cc3fbbdcf2ff8cfb1474305f4bad9a144994/colombia-states-cities-combined.json';

    const polygonTemplate = colombiaSeries.mapPolygons.template;
    polygonTemplate.tooltipText = '{NAME_1}';
    polygonTemplate.fill = am4core.color('#16C6CC');

    const hs = polygonTemplate.states.create('hover');
    hs.properties.fill = am4core.color('#C8C4BE');

    const states = [];
    const cities = [];

    const cityColor = am4core.color('#8CD790');
    const cityHoverColor = am4core.color('#77AF9C');
    const cityOpacity = 0.2;
    let stateBrightenLevel = -0.7;

    colombiaSeries.events.on('validated', () => {
      if (colombiaSeries.mapPolygons.length) {

        setTimeout(() => {
          loadingLabel.hide();
        }, 100);

        colombiaSeries.mapPolygons.each(polygon => {
          const citySpriteState = polygon.states.create('cityMode');
          const stateSpriteState = polygon.states.create('stateMode');
          const data = polygon.dataItem.dataContext;

          if (data.GID_2) {
            cities.push(polygon);
            polygon.tooltipText = '{NAME_2}, {NAME_1}';

            polygon.fill = cityColor;
            polygon.fillOpacity = cityOpacity;
            polygon.strokeOpacity = cityOpacity;
            polygon.defaultState.fill = cityColor;
            polygon.defaultState.fillOpacity = cityOpacity;
            polygon.defaultState.strokeOpacity = cityOpacity;

            polygon.states.getKey('hover').properties.fill = cityHoverColor;
            polygon.states.getKey('hover').properties.fillOpacity = 1;

            citySpriteState.properties.fill = cityColor;
            citySpriteState.properties.fillOpacity = cityOpacity;
            stateSpriteState.properties.fillOpacity = 0;

            polygon.hide();
          } else {
            states.push(polygon);

            if (stateBrightenLevel === 0.6) {
              stateBrightenLevel = -0.7;
            }

            stateBrightenLevel += 0.1;

            const customColor = polygonTemplate.fill.brighten(stateBrightenLevel);
            polygon.fill = customColor;
            polygon.defaultState.properties.fill = customColor;

            citySpriteState.properties.fillOpacity = 0;
          }
        });

        colombiaSeries.visible = true;
      }
    });

    polygonTemplate.events.on('hit', ev => {
      this.chart.zoomToMapObject(ev.target);

      if (!ev.target.dataItem.dataContext.GID_2) {
        cities.forEach(city => {
          city.show();
        });
      }
    });

    let zoomLevel = 1;
    const cityThreshold = 2.5;

    this.chart.events.on('zoomlevelchanged', (x) => {
      const currentZoom = this.chart.zoomLevel;

      if ((zoomLevel >= cityThreshold) && (this.chart.zoomLevel < cityThreshold)) {
        const total_cities = cities.length;

        cities.forEach(function (city, index) {
          const animation = city.hide();
        });
      }

      zoomLevel = this.chart.zoomLevel;
    });

    this.imageSeries = this.chart.series.push(new am4maps.MapImageSeries());
    const imageTemplate = this.imageSeries.mapImages.template;
    imageTemplate.propertyFields.longitude = 'longitude';
    imageTemplate.propertyFields.latitude = 'latitude';
    imageTemplate.nonScaling = true;

    const image = imageTemplate.createChild(am4core.Image);
    image.propertyFields.href = 'image';
    image.width = 100;
    image.height = 100;
    image.horizontalCenter = 'middle';
    image.verticalCenter = 'middle';

    const imageLabel = imageTemplate.createChild(am4core.Label);
    imageLabel.text = '{citName} - {countItems}';
    imageLabel.horizontalCenter = 'middle';
    imageLabel.verticalCenter = 'top';
    imageLabel.dy = 20;
  }

  public clickCategory(category: String) {
    this.subcategoryTitle = category;
    this.fillSelectOptions(category);
  }

  public selectValue(value: any) {
    this.subcategory = value;
  }

  public redirect(event) {
    console.log('redirect');
    this.router.navigate(['']);
  }

  private fillSelectOptions(category) {
    switch (category) {
      case 'Ambiente':
        this.category = 'A';
        this.categoryTitle = 'A';
        this.dataSelect = this.getCategoryEnvironment();
        break;
      case 'Salud':
        this.category = 'B';
        this.categoryTitle = 'B';
        this.dataSelect = this.getCategoryHealth();
        break;
      case 'Infancia':
        this.category = 'C';
        this.categoryTitle = 'C';
        this.dataSelect = this.getCategoryInfant();
        break;
      case 'Educación':
        this.category = 'D';
        this.categoryTitle = 'D';
        this.dataSelect = this.getCategoryEducation();
        break;
      case 'Obras':
        this.category = 'E';
        this.categoryTitle = 'E';
        this.dataSelect = this.getCategoryObras();
        break;
      case 'Seguridad':
        this.category = 'F';
        this.categoryTitle = 'F';
        this.dataSelect = this.getCategorySecurity();
        break;
      case 'Corrupción':
        this.category = 'G';
        this.categoryTitle = 'G';
        this.dataSelect = this.getCategoryCorruption();
        break;
      case 'Servicios públicos':
        this.category = 'H';
        this.categoryTitle = 'H';
        this.dataSelect = this.getCategoryServiciosPublicos();
        break;
      case 'Discriminación':
        this.category = 'I';
        this.categoryTitle = 'I';
        this.dataSelect = this.getCategoryDiscrimination();
        break;
      case 'Movilidad':
        this.category = 'J';
        this.categoryTitle = 'J';
        this.dataSelect = this.getCategoryTransport();
        break;

      case 'Vivienda':
        this.category = 'K';
        this.categoryTitle = 'K';
        this.dataSelect = this.getCategoryVivienda();
        break;
      case 'Pensiones':
        this.category = 'L';
        this.categoryTitle = 'L';
        this.dataSelect = this.getCategoryPensiones();
        break;
      case 'QuejaEmpresa':
        this.category = 'M';
        this.categoryTitle = 'M';
        this.dataSelect = this.getCategoryQuejaEmpresa();
        break;
    }

    console.log(this.dataSelect);
  }

  private getCategoryCorruption(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'G1', name: 'Obras' });
    subCatList.push({ id: 'G2', name: 'Educación' });
    subCatList.push({ id: 'G3', name: 'Salud' });
    subCatList.push({ id: 'G4', name: 'Otros' });

    return subCatList;
  }

  private getCategoryEducation(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'D1', name: '(Colegio) - No hay un centro educativo' });
    subCatList.push({ id: 'D2', name: '(Colegio) - No hay como llegar al centro educativo' });
    subCatList.push({ id: 'D3', name: '(Colegio) - No hay quién dicte clases en el centro educativo' });
    subCatList.push({ id: 'D4', name: '(Univ.) - No hay un centro educativo' });
    subCatList.push({ id: 'D5', name: '(Univ.) - No hay como llegar al centro educativo' });
    subCatList.push({ id: 'D6', name: '(Univ.) - No hay quién dicte clases en el centro educativo' });

    return subCatList;
  }

  private getCategoryHealth(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'B1', name: 'Problema de Salud' });
    subCatList.push({ id: 'B2', name: 'Citas' });
    subCatList.push({ id: 'B3', name: 'Autorizaciones' });
    subCatList.push({ id: 'B4', name: 'Entrega de Medicamentos' });
    subCatList.push({ id: 'B5', name: 'No hay acceso a un centro de salud a menos de 30 Km' });

    return subCatList;
  }

  private getCategorySecurity(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'F1', name: 'Grupos al Margen de la Ley' });
    subCatList.push({ id: 'F2', name: 'Violencia Intrafamiliar' });
    subCatList.push({ id: 'F3', name: 'Amenazas' });
    subCatList.push({ id: 'F4', name: 'Desplazamiento' });
    subCatList.push({ id: 'F5', name: 'Víctima de robo' });
    subCatList.push({ id: 'F6', name: 'Riñas' });

    return subCatList;
  }

  private getCategoryEnvironment(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'A1', name: 'Contaminación de Agua' });
    subCatList.push({ id: 'A2', name: 'Contaminación de Aire' });
    subCatList.push({ id: 'A3', name: 'Residuos Tóxicos' });
    subCatList.push({ id: 'A4', name: 'Basuras' });
    subCatList.push({ id: 'A5', name: 'Minería' });
    subCatList.push({ id: 'A6', name: 'Deforestación' });
    subCatList.push({ id: 'A7', name: 'Plagas' });

    return subCatList;
  }

  private getCategoryDiscrimination(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'I1', name: 'LGBTI' });
    subCatList.push({ id: 'I2', name: 'Racial' });
    subCatList.push({ id: 'I3', name: 'Social' });
    subCatList.push({ id: 'I4', name: 'Ideológica' });

    return subCatList;
  }


  private getCategoryServiciosPublicos(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'H1', name: 'Acueducto y alcantarillado' });
    subCatList.push({ id: 'H2', name: 'Luz' });
    subCatList.push({ id: 'H3', name: 'Gas' });
    subCatList.push({ id: 'H4', name: 'Internet' });
    subCatList.push({ id: 'H5', name: 'Transporte público' });

    return subCatList;
  }

  private getCategoryObras(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'D1', name: 'Víales' });
    subCatList.push({ id: 'D2', name: 'Espacio público' });
    subCatList.push({ id: 'D3', name: 'Parques' });
    subCatList.push({ id: 'D4', name: 'Acueducto y alcantarillado' });
    subCatList.push({ id: 'D5', name: 'Alumbrado' });
    subCatList.push({ id: 'D6', name: 'Transporte público' });
    subCatList.push({ id: 'D7', name: 'Semaforización' });

    return subCatList;
  }


  private getCategoryTransport(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'J1', name: 'No hay transporte público' });
    subCatList.push({ id: 'J2', name: 'No hay carreteras o infraestructura para usar un medo de transporte' });
    subCatList.push({ id: 'J3', name: 'Señalización' });
    subCatList.push({ id: 'J4', name: 'Hay accidentes en la vía' });

    return subCatList;
  }

  private getCategoryVivienda(): SubCategory[] {
    const subCatList: SubCategory[] = [];
    subCatList.push({ id: 'K1', name: 'Vivienda inestable/precaria' });
    subCatList.push({ id: 'K2', name: 'Hacinamiento' });
    subCatList.push({ id: 'K3', name: 'Servicios inadecuados' });
    subCatList.push({ id: 'K4', name: 'Cocina no apta' });
    return subCatList;
  }

  private getCategoryPensiones(): SubCategory[] {
    const subCatList: SubCategory[] = [];
    subCatList.push({ id: 'L1', name: 'Punto de atención' });
    subCatList.push({ id: 'L2', name: 'Monto incorrecto' });
    return subCatList;
  }


  private getCategoryQuejaEmpresa(): SubCategory[] {
    const subCatList: SubCategory[] = [];
    subCatList.push({ id: 'M1', name: 'Queja empresa' });
    return subCatList;
  }

  private getCategoryInfant(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'C1', name: 'Trabajo forzado' });
    subCatList.push({ id: 'C2', name: 'Abandono' });
    subCatList.push({ id: 'C3', name: 'Violencia' });
    subCatList.push({ id: 'C4', name: 'Salud' });
    subCatList.push({ id: 'C5', name: 'Educación' });

    return subCatList;
  }

  public searchResults() {
    this.imageSeries.data = [];

    this.dataService.getSingle(this.category, this.subcategory)
      .subscribe((data: Record) => {
        this.imageSeries.data = data;
        console.log(data);
      }, error => () => {
        console.log('Ocurrió un error al traer los datos', error);
      }, () => {
        console.log('Se obtienen los datos');
      });
  }
}
