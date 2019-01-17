import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Records } from 'src/app/shared/models/records';
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
export class ResultsComponent implements OnInit {

  public category: String;
  public subcategory: String;

  public dataSelect: SubCategory[];
  public subcategoryTitle: String;

  public data: Records;
  public message: String;

  constructor(private router: Router, private dataService: DataService) { }

  ngOnInit() {
    this.category = 'C';
    this.subcategoryTitle = `Selecciona la subcategoría para 'Corrupción'`;
    this.fillSelectOptions('Corrupción');

    // this.dataService.getAll()
    //   .subscribe((data: Records) => {
    //     this.data = data;
    //   }, error => () => {
    //     console.log('Ocurrió un error al traer los datos', error);
    //   }, () => {
    //     console.log('Se obtienen los datos');
    //   });
  }

  public clickCategory(category: String) {
    this.subcategoryTitle = `Selecciona la subcategoría para '${category}'`;
    this.fillSelectOptions(category);
  }

  public redirect(event) {
    console.log('redirect');
    this.router.navigate(['']);
  }

  private fillSelectOptions(category) {
    switch (category) {
      case 'Corrupción':
        this.dataSelect = this.getCategoryCorruption();
        break;
      case 'Educación':
        this.dataSelect = this.getCategoryEducation();
        break;
      case 'Salud':
        this.dataSelect = this.getCategoryHealth();
        break;
      case 'Seguridad':
        this.dataSelect = this.getCategorySecurity();
        break;
      case 'Ambiente':
        this.dataSelect = this.getCategoryEnvironment();
        break;
      case 'Discriminación':
        this.dataSelect = this.getCategoryDiscrimination();
        break;
      case 'Movilidad':
        this.dataSelect = this.getCategoryTransport();
        break;
      case 'Infancia':
        this.dataSelect = this.getCategoryInfant();
        break;
    }

    console.log(this.dataSelect);
  }

  private getCategoryCorruption(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'C1', name: 'Obras' });
    subCatList.push({ id: 'C2', name: 'Educación' });
    subCatList.push({ id: 'C3', name: 'Salud' });
    subCatList.push({ id: 'C4', name: 'Otros' });

    return subCatList;
  }

  private getCategoryEducation(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'E1', name: '(Colegio) - No hay un centro educativo' });
    subCatList.push({ id: 'E2', name: '(Colegio) - No hay como llegar al centro educativo' });
    subCatList.push({ id: 'E3', name: '(Colegio) - No hay quién dicte clases en el centro educativo' });
    subCatList.push({ id: 'E4', name: '(Univ.) - No hay un centro educativo' });
    subCatList.push({ id: 'E5', name: '(Univ.) - No hay como llegar al centro educativo' });
    subCatList.push({ id: 'E6', name: '(Univ.) - No hay quién dicte clases en el centro educativo' });

    return subCatList;
  }

  private getCategoryHealth(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'S1', name: 'Problema de Salud' });
    subCatList.push({ id: 'S2', name: 'Citas' });
    subCatList.push({ id: 'S3', name: 'Autorizaciones' });
    subCatList.push({ id: 'S4', name: 'Entrega de Medicamentos' });
    subCatList.push({ id: 'S5', name: 'No hay acceso a un centro de salud a menos de 30 Km' });

    return subCatList;
  }

  private getCategorySecurity(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'S1', name: 'Grupos al Margen de la Ley' });
    subCatList.push({ id: 'S2', name: 'Violencia Intrafamiliar' });
    subCatList.push({ id: 'S3', name: 'Amenazas' });
    subCatList.push({ id: 'S4', name: 'Desplazamiento' });
    subCatList.push({ id: 'S5', name: 'Víctima de robo' });
    subCatList.push({ id: 'S6', name: 'Riñas' });

    return subCatList;
  }

  private getCategoryEnvironment(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'A1', name: 'Contaminación de Agua' });
    subCatList.push({ id: 'A2', name: 'Contaminación de Aire' });
    subCatList.push({ id: 'A3', name: 'Residuos Tóxicos' });
    subCatList.push({ id: 'A4', name: 'Basuras' });
    subCatList.push({ id: 'A5', name: 'Minería' });
    subCatList.push({ id: '', name: 'Deforestación' });
    subCatList.push({ id: 'A6', name: 'Plagas' });

    return subCatList;
  }

  private getCategoryDiscrimination(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'D1', name: 'LGBTI' });
    subCatList.push({ id: 'D2', name: 'Racial' });
    subCatList.push({ id: 'D3', name: 'Social' });
    subCatList.push({ id: 'D4', name: 'Ideológica' });

    return subCatList;
  }

  private getCategoryTransport(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'M1', name: 'No hay transporte público' });
    subCatList.push({ id: 'M2', name: 'No hay carreteras o infraestructura para usar un medo de transporte' });
    subCatList.push({ id: 'M3', name: 'Señalización' });
    subCatList.push({ id: 'M4', name: 'Hay accidentes en la vía' });

    return subCatList;
  }

  private getCategoryInfant(): SubCategory[] {
    const subCatList: SubCategory[] = [];

    subCatList.push({ id: 'I1', name: 'Trabajo forzado' });
    subCatList.push({ id: 'I2', name: 'Abandono' });
    subCatList.push({ id: 'I3', name: 'Violencia' });
    subCatList.push({ id: 'I4', name: 'Salud' });
    subCatList.push({ id: 'I5', name: 'Educación' });

    return subCatList;
  }

}
