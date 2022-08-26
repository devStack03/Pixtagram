
import {last,  filter } from 'rxjs/operators';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Create the injection token for the custom settings
export const SEARCH_CONFIG = new InjectionToken('searchConfig');

@Injectable({
    providedIn: 'root'
})
export class SearchConfigService
{
    // Private
    public _searchSubject: BehaviorSubject<any>;

    /**
     * Constructor
     */
    constructor()
    {
        // Initialize the service
        this._searchSubject = new BehaviorSubject<any>(null);
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set search
     *
     * @param value
     */
    setSearch(value): void
    {
        this._searchSubject.next(value);
    }

    /**
     * Get config
     *
     * @returns {Observable<any>}
     */
    getSearch(): Observable<any>
    {
        return this._searchSubject.pipe(last());
    }

    subscribe(next) 
    {
        this._searchSubject.observers = [];
        this._searchSubject.subscribe(next);
    }
}

