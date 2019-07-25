import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Record } from 'src/app/shared/models/records';
import { CounterCategory } from 'src/app/shared/models/counterCategory';
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

  public counterCategory: CounterCategory;
  public data: Record;
  public message: String;

  private category: String;
  private resultMap: Map<string , number> ;
  private  objectParamInit: any;
  private  objectParamX: any;
  private subcategory: String;
  private chart: any;
  private imageSeries: any;

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.category = 'A';
    this.categoryTitle = 'A';
    this.subcategoryTitle = `Ambiente`;
    this.resultMap = new Map();

    this.dataService.getSummaryCount()
      .subscribe((data: CounterCategory) => {
        this.counterCategory = data;
        console.log(data);
      }, error => () => {
        console.log('Ocurrió un error al traer los datos', error);
      }, () => {
        console.log('Se obtienen los datos');
      });

    this.dataService.getCounterAllSubCategories('A')
      .subscribe((data: string) => {
        this.objectParamInit = JSON.parse(JSON.stringify(data));
        this.resultMap = new Map();
        for (let k of Object.keys(this.objectParamInit)) {
          this.resultMap.set(k, this.objectParamInit[k]);
        }
        this.fillSelectOptions('Ambiente');
      }, error => () => {
        console.log('Ocurrió un error al traer los datos', error);
      }, () => {
        console.log('Se obtienen los datos');
      });

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
        break;
      case 'Salud':
        this.category = 'B';
        this.categoryTitle = 'B';
        break;
      case 'Infancia':
        this.category = 'C';
        this.categoryTitle = 'C';
        break;
      case 'Educación':
        this.category = 'D';
        this.categoryTitle = 'D';
        break;
      case 'Infraestructura':
        this.category = 'E';
        this.categoryTitle = 'E';
        break;
      case 'Seguridad':
        this.category = 'F';
        this.categoryTitle = 'F';
        break;
      case 'Corrupción':
        this.category = 'G';
        this.categoryTitle = 'G';
        break;
      case 'Servicios públicos':
        this.category = 'H';
        this.categoryTitle = 'H';
        break;
      case 'Discriminación':
        this.category = 'I';
        this.categoryTitle = 'I';
        break;
      case 'Movilidad':
        this.category = 'J';
        this.categoryTitle = 'J';
        break;

      case 'Vivienda':
        this.category = 'K';
        this.categoryTitle = 'K';
        break;
      case 'Pensiones':
        this.category = 'L';
        this.categoryTitle = 'L';
        break;
      case 'QuejaEmpresa':
        this.category = 'M';
        this.categoryTitle = 'M';
        break;

    }
    this.dataService.getCounterAllSubCategories(this.category)
      .subscribe((data: string) => {
        this.objectParamX = JSON.parse(JSON.stringify(data));
        this.resultMap = new Map();
        if(this.resultMap !== undefined ) {
          for (let kkkk of Object.keys(this.objectParamX)) {
            console.log('SISASSSSSSSSSSSSSS' + kkkk + this.objectParamX[kkkk]);
            this.resultMap.set(kkkk, this.objectParamX[kkkk]);
          }
        }

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
          case 'Infraestructura':
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

        console.log('TAMARINDO------------' + JSON.stringify(this.resultMap)+"----------"+Object.keys(this.objectParamX));
      }, error => () => {
        console.log('Ocurrió un error al traer los datos', error);
      }, () => {
        console.log('Se obtienen los datos');
      });




    console.log(this.dataSelect);
  }

  private getCategoryCorruption(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'G1', name: 'Obras' , number: this.resultMap  !== undefined && this.resultMap.has('G1') ? this.resultMap.get('G1') : 0});
    subCatList.push({ id: 'G2', name: 'Educación', number: this.resultMap  !== undefined && this.resultMap.has('G2') ? this.resultMap.get('G2') : 0});
    subCatList.push({ id: 'G3', name: 'Salud', number: this.resultMap  !== undefined && this.resultMap.has('G3') ? this.resultMap.get('G3') : 0});
    subCatList.push({ id: 'G4', name: 'Otros', number: this.resultMap  !== undefined && this.resultMap.has('G4') ? this.resultMap.get('G4') : 0});

    return subCatList;
  }

  private getCategoryEducation(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'D1', name: '(Colegio) - No hay un centro educativo', number: this.resultMap  !== undefined && this.resultMap.has('D1') ? this.resultMap.get('D1') : 0});
    subCatList.push({ id: 'D2', name: '(Colegio) - No hay como llegar al centro educativo', number: this.resultMap  !== undefined && this.resultMap.has('D2') ? this.resultMap.get('D2') : 0});
    subCatList.push({ id: 'D3', name: '(Colegio) - No hay quién dicte clases en el centro educativo', number: this.resultMap  !== undefined && this.resultMap.has('D3') ? this.resultMap.get('D3') : 0});
    subCatList.push({ id: 'D4', name: '(Univ.) - No hay un centro educativo', number: this.resultMap  !== undefined && this.resultMap.has('D4') ? this.resultMap.get('D4') : 0});
    subCatList.push({ id: 'D5', name: '(Univ.) - No hay como llegar al centro educativo', number: this.resultMap  !== undefined && this.resultMap.has('D5') ? this.resultMap.get('D5') : 0});
    subCatList.push({ id: 'D6', name: '(Univ.) - No hay quién dicte clases en el centro educativo', number: this.resultMap  !== undefined && this.resultMap.has('D6') ? this.resultMap.get('D6') : 0});

    return subCatList;
  }

  private getCategoryHealth(): SubCategory[] {
    const subCatList: SubCategory[] = [];
    console.log('DLSP-.-----------------' + JSON.stringify(this.resultMap ) + 'SAYAYIN' + this.resultMap.keys());
    subCatList.push({ id: 'B1', name: 'Problema de Salud', number: this.resultMap  !== undefined && this.resultMap.has('B1') ? this.resultMap.get('B1') : 0});
    subCatList.push({ id: 'B2', name: 'Citas', number: this.resultMap  !== undefined && this.resultMap.has('B2') ? this.resultMap.get('B2') : 0});
    subCatList.push({ id: 'B3', name: 'Autorizaciones', number: this.resultMap  !== undefined && this.resultMap.has('B3') ? this.resultMap.get('B3') : 0});
    subCatList.push({ id: 'B4', name: 'Entrega de Medicamentos', number: this.resultMap  !== undefined && this.resultMap.has('B4') ? this.resultMap.get('B4') : 0});
    subCatList.push({ id: 'B5', name: 'No hay acceso a un centro de salud a menos de 30 Km', number: this.resultMap  !== undefined && this.resultMap.has('B5') ? this.resultMap.get('B5') : 0});

    return subCatList;
  }

  private getCategorySecurity(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'F1', name: 'Grupos al Margen de la Ley', number: this.resultMap  !== undefined && this.resultMap.has('F1') ? this.resultMap.get('F1') : 0});
    subCatList.push({ id: 'F2', name: 'Violencia Intrafamiliar', number: this.resultMap  !== undefined && this.resultMap.has('F2') ? this.resultMap.get('F2') : 0});
    subCatList.push({ id: 'F3', name: 'Amenazas', number: this.resultMap  !== undefined && this.resultMap.has('F3') ? this.resultMap.get('F3') : 0});
    subCatList.push({ id: 'F4', name: 'Desplazamiento', number: this.resultMap  !== undefined && this.resultMap.has('F4') ? this.resultMap.get('F4') : 0});
    subCatList.push({ id: 'F5', name: 'Víctima de robo', number: this.resultMap  !== undefined && this.resultMap.has('F5') ? this.resultMap.get('F5') : 0});
    subCatList.push({ id: 'F6', name: 'Riñas', number: this.resultMap  !== undefined && this.resultMap.has('F6') ? this.resultMap.get('F6') : 0});

    return subCatList;
  }

  private getCategoryEnvironment(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'A1', name: 'Contaminación de Agua', number: this.resultMap  !== undefined && this.resultMap.has('A1') ? this.resultMap.get('A1') : 0});
    subCatList.push({ id: 'A2', name: 'Contaminación de Aire', number: this.resultMap  !== undefined && this.resultMap.has('A2') ? this.resultMap.get('A2') : 0});
    subCatList.push({ id: 'A3', name: 'Residuos Tóxicos', number: this.resultMap  !== undefined && this.resultMap.has('A3') ? this.resultMap.get('A3') : 0});
    subCatList.push({ id: 'A4', name: 'Basuras', number: this.resultMap  !== undefined && this.resultMap.has('A4') ? this.resultMap.get('A4') : 0});
    subCatList.push({ id: 'A5', name: 'Minería', number: this.resultMap  !== undefined && this.resultMap.has('A5') ? this.resultMap.get('A5') : 0});
    subCatList.push({ id: 'A6', name: 'Deforestación', number: this.resultMap  !== undefined && this.resultMap.has('A6') ? this.resultMap.get('A6') : 0});
    subCatList.push({ id: 'A7', name: 'Plagas', number: this.resultMap  !== undefined && this.resultMap.has('A7') ? this.resultMap.get('A7') : 0});

    return subCatList;
  }

  private getCategoryDiscrimination(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'I1', name: 'LGBTI', number: this.resultMap  !== undefined && this.resultMap.has('I1') ? this.resultMap.get('I1') : 0});
    subCatList.push({ id: 'I2', name: 'Racial', number: this.resultMap  !== undefined && this.resultMap.has('I2') ? this.resultMap.get('I2') : 0});
    subCatList.push({ id: 'I3', name: 'Social', number: this.resultMap  !== undefined && this.resultMap.has('I3') ? this.resultMap.get('I3') : 0});
    subCatList.push({ id: 'I4', name: 'Ideológica', number: this.resultMap  !== undefined && this.resultMap.has('I4') ? this.resultMap.get('I4') : 0});

    return subCatList;
  }


  private getCategoryServiciosPublicos(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'H1', name: 'Acueducto y alcantarillado', number: this.resultMap  !== undefined && this.resultMap.has('H1') ? this.resultMap.get('H1') : 0});
    subCatList.push({ id: 'H2', name: 'Luz', number: this.resultMap  !== undefined && this.resultMap.has('H2') ? this.resultMap.get('H2') : 0});
    subCatList.push({ id: 'H3', name: 'Gas', number: this.resultMap  !== undefined && this.resultMap.has('H3') ? this.resultMap.get('H3') : 0});
    subCatList.push({ id: 'H4', name: 'Internet', number: this.resultMap  !== undefined && this.resultMap.has('H4') ? this.resultMap.get('H4') : 0});
    subCatList.push({ id: 'H5', name: 'Transporte público', number: this.resultMap  !== undefined && this.resultMap.has('H5') ? this.resultMap.get('H5') : 0});

    return subCatList;
  }

  private getCategoryObras(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'E1', name: 'Víales', number: this.resultMap  !== undefined && this.resultMap.has('E1') ? this.resultMap.get('E1') : 0});
    subCatList.push({ id: 'E2', name: 'Espacio público', number: this.resultMap  !== undefined && this.resultMap.has('E2') ? this.resultMap.get('E2') : 0});
    subCatList.push({ id: 'E3', name: 'Parques', number: this.resultMap  !== undefined && this.resultMap.has('E3') ? this.resultMap.get('E3') : 0});
    subCatList.push({ id: 'EE4', name: 'Acueducto y alcantarillado', number: this.resultMap  !== undefined && this.resultMap.has('D4') ? this.resultMap.get('E4') : 0});
    subCatList.push({ id: 'E5', name: 'Alumbrado', number: this.resultMap  !== undefined && this.resultMap.has('E5') ? this.resultMap.get('E5') : 0});
    subCatList.push({ id: 'E6', name: 'Transporte público', number: this.resultMap  !== undefined && this.resultMap.has('E6') ? this.resultMap.get('E6') : 0});
    subCatList.push({ id: 'E7', name: 'Semaforización', number: this.resultMap  !== undefined && this.resultMap.has('E7') ? this.resultMap.get('E7') : 0});

    return subCatList;
  }


  private getCategoryTransport(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'J1', name: 'No hay transporte público', number: this.resultMap  !== undefined && this.resultMap.has('J1') ? this.resultMap.get('J1') : 0});
    subCatList.push({ id: 'J2', name: 'No hay carreteras o infraestructura para usar un medo de transporte', number: this.resultMap  !== undefined && this.resultMap.has('J2') ? this.resultMap.get('J2') : 0});
    subCatList.push({ id: 'J3', name: 'Señalización', number: this.resultMap  !== undefined && this.resultMap.has('J3') ? this.resultMap.get('J3') : 0});
    subCatList.push({ id: 'J4', name: 'Hay accidentes en la vía', number: this.resultMap  !== undefined && this.resultMap.has('J4') ? this.resultMap.get('J4') : 0});

    return subCatList;
  }

  private getCategoryVivienda(): SubCategory[] {
    const subCatList: SubCategory[] = [];
    subCatList.push({ id: 'K1', name: 'Vivienda inestable/precaria', number: this.resultMap  !== undefined && this.resultMap.has('K1') ? this.resultMap.get('K1') : 0});
    subCatList.push({ id: 'K2', name: 'Hacinamiento', number: this.resultMap  !== undefined && this.resultMap.has('K2') ? this.resultMap.get('K1') : 0});
    subCatList.push({ id: 'K3', name: 'Servicios inadecuados', number: this.resultMap  !== undefined && this.resultMap.has('K3') ? this.resultMap.get('K1') : 0});
    subCatList.push({ id: 'K4', name: 'Cocina no apta', number: this.resultMap  !== undefined && this.resultMap.has('K4') ? this.resultMap.get('K1') : 0});
    return subCatList;
  }

  private getCategoryPensiones(): SubCategory[] {
    const subCatList: SubCategory[] = [];
    subCatList.push({ id: 'L1', name: 'Punto de atención', number: this.resultMap  !== undefined && this.resultMap.has('L1') ? this.resultMap.get('L1') : 0});
    subCatList.push({ id: 'L2', name: 'Monto incorrecto', number: this.resultMap  !== undefined && this.resultMap.has('L2') ? this.resultMap.get('L1') : 0});
    return subCatList;
  }


  private getCategoryQuejaEmpresa(): SubCategory[] {
    const subCatList: SubCategory[] = [];
    subCatList.push({ id: 'M1', name: 'Queja empresa', number: this.resultMap  !== undefined && this.resultMap.has('M1') ? this.resultMap.get('M1') : 0});
    return subCatList;
  }

  private getCategoryInfant(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'C1', name: 'Trabajo forzado', number: this.resultMap  !== undefined && this.resultMap.has('C1') ? this.resultMap.get('C1') : 0});
    subCatList.push({ id: 'C2', name: 'Abandono', number: this.resultMap  !== undefined && this.resultMap.has('C2') ? this.resultMap.get('C2') : 0});
    subCatList.push({ id: 'C3', name: 'Violencia', number: this.resultMap  !== undefined && this.resultMap.has('C3') ? this.resultMap.get('C3') : 0});
    subCatList.push({ id: 'C4', name: 'Salud', number: this.resultMap  !== undefined && this.resultMap.has('C4') ? this.resultMap.get('C4') : 0});
    subCatList.push({ id: 'C5', name: 'Educación', number: this.resultMap  !== undefined && this.resultMap.has('C5') ? this.resultMap.get('C5') : 0});
    subCatList.push({ id: 'C6', name: 'Alimentación', number: this.resultMap  !== undefined && this.resultMap.has('C5') ? this.resultMap.get('C6') : 0});

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
