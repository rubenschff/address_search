import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, filter, map, of, switchMap, tap } from 'rxjs';
import { NgIf, NgFor } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

interface Address {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  numero: string;
  uf: string;
}

interface IBGEDefault {
  id: number;
  nome: string;
}

interface State extends IBGEDefault {
  sigla: string;
}
interface City extends IBGEDefault {}

@Component({
  selector: 'app-address-finder',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './address-finder.component.html',
  styleUrl: './address-finder.component.scss'
})
export class AddressFinderComponent {

  public form = new FormGroup({
    cep: new FormControl('', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]),
    localidade: new FormControl('', [Validators.required, Validators.minLength(3)]),
    uf: new FormControl('', [Validators.required]),
    bairro: new FormControl('', [Validators.required, Validators.minLength(3)]),
    logradouro: new FormControl('', [Validators.required, Validators.minLength(3)]),
    numero: new FormControl('', [Validators.required]),
    sn: new FormControl(false),
    complemento: new FormControl(''),
  });

  public cities: City[] = [];
  public states: State[] = [];

  constructor(
    private globalService: GlobalService
  ) {
    this.formValidators();
    this.getStates();
  }

  get controls() {
    return this.form.controls;
  }

  private formValidators() {
    this.controls.cep.valueChanges
    .pipe(
      debounceTime(500),
      filter(() => this.controls.cep.valid),
      map(value => (value as string).replace(/\D/g, '')),
      tap(cep => this.searchAddress(cep))
    ).subscribe();

    this.controls.sn.valueChanges.subscribe((value) => {
      if (value) {
        this.controls.numero.clearValidators();
        this.controls.numero.disable();
        this.controls.numero.setValue('');
      } else {
        this.controls.numero.setValidators([Validators.required]);
        this.controls.numero.enable();
      }
      this.controls.numero.updateValueAndValidity();
    });

    this.controls.uf.valueChanges
    .pipe(
      debounceTime(500),
      filter(() => this.controls.uf.valid),
      tap(() => this.getCitiesByState())
    ).subscribe();
  }

  private searchAddress(cep: string) {
    this.globalService.get<Address>(`https://viacep.com.br/ws/${cep}/json/`)
    .subscribe(({cep, ...rest}) => {
      this.controls.cep.setValue(cep, {emitEvent: false});
      this.form.patchValue(rest, { emitEvent: false });
    });
  }

  private getCitiesByState() {
    const uf = this.controls.uf.value;
    this.globalService.get<City[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
    .subscribe(cities => {
      this.cities = cities;
    });
  }

  private getStates() {
    this.globalService.get<State[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome`)
      .subscribe(states => {
        this.states = states;
      });
  }

  public searchCep() {

    const { uf, localidade, logradouro } = this.controls;

    if (uf.invalid || localidade.invalid || logradouro.invalid) {
      uf.markAsTouched();
      localidade.markAsTouched();
      logradouro.markAsTouched();
      return;
    }

    const cidade = this.limparString(localidade.value as string).split(' ').join('+');
    const estado = uf.value;
    const rua = this.limparString(logradouro.value as string).split(' ').join('+');

    this.globalService.get<Address[]>(`https://viacep.com.br/ws/${estado}/${cidade}/${rua}/json/`)
    .pipe(
      map((response) => this.form.patchValue(response[0], { emitEvent: false })),
      catchError((err: HttpErrorResponse) => {
        console.error('Error fetching address:', err);
        return of(null);
      }),
    ).subscribe();
  }

  private limparString(str: string): string {
    return str
        .normalize("NFD") // Decompõe os caracteres acentuados em seus equivalentes sem acento + o acento isolado
        .replace(/[\u0300-\u036f]/g, "") // Remove os acentos isolados (Unicode combinantes)
        .replace(/[^a-zA-Z0-9 ]/g, "") // Remove tudo o que NÃO for letra, número ou espaço
        .trim(); // Remove espaços extras nas pontas
}


}
