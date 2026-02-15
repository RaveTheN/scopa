"use strict";
(self["webpackChunkscopa"] = self["webpackChunkscopa"] || []).push([["main"],{

/***/ 92:
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AppComponent: () => (/* binding */ AppComponent)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! rxjs */ 9999);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! rxjs */ 271);
/* harmony import */ var _components_card_grid_card_grid_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/card-grid/card-grid.component */ 569);
/* harmony import */ var _components_toolbar_toolbar_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/toolbar/toolbar.component */ 2305);
/* harmony import */ var _components_stats_panel_stats_panel_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/stats-panel/stats-panel.component */ 9245);
/* harmony import */ var _components_hand_selector_hand_selector_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/hand-selector/hand-selector.component */ 6765);
/* harmony import */ var _components_ai_suggestion_panel_ai_suggestion_panel_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/ai-suggestion-panel/ai-suggestion-panel.component */ 3593);
/* harmony import */ var _components_log_bar_log_bar_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/log-bar/log-bar.component */ 6529);
/* harmony import */ var _models_card_model__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./models/card.model */ 1512);
/* harmony import */ var _utils_combinations_util__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils/combinations.util */ 2010);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _services_game_state_service__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./services/game-state.service */ 5236);
/* harmony import */ var _services_probability_service__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./services/probability.service */ 9677);
/* harmony import */ var _services_ai_suggestion_service__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./services/ai-suggestion.service */ 9179);















function AppComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](1, " Selezionare combinazione ");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
}
function AppComponent_div_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 4)(1, "div")(2, "h2");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](3, "Tavolo");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](4, "app-card-grid", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵlistener"]("cardClicked", function AppComponent_div_7_Template_app_card_grid_cardClicked_4_listener($event) {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵrestoreView"](_r4);
      const tableVm_r2 = restoredCtx.ngIf;
      const ctx_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵresetView"](ctx_r3.onTableCardClicked($event, tableVm_r2.phase));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](5, "app-hand-selector")(6, "app-ai-suggestion-panel");
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const tableVm_r2 = ctx.ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("cardStates", tableVm_r2.cardStates)("probabilities", tableVm_r2.probabilities)("selectableCardIds", tableVm_r2.selectableCardIds)("phase", tableVm_r2.phase);
  }
}
class AppComponent {
  constructor(gameStateService, probabilityService, aiSuggestionService) {
    this.gameStateService = gameStateService;
    this.probabilityService = probabilityService;
    this.aiSuggestionService = aiSuggestionService;
    this.gamePhase = _models_card_model__WEBPACK_IMPORTED_MODULE_6__.GamePhase;
    this.phase$ = this.gameStateService.phase;
    this.tableVm$ = (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.combineLatest)([this.gameStateService.state, this.probabilityService.probabilities$]).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_13__.map)(([state, probabilities]) => {
      const probabilityRecord = {};
      for (let rank = 1; rank <= 10; rank += 1) {
        probabilityRecord[rank] = probabilities.get(rank) ?? 0;
      }
      return {
        cardStates: state.cardStates,
        probabilities: probabilityRecord,
        selectableCardIds: this.buildSelectableSet(state),
        phase: state.phase
      };
    }));
    void this.aiSuggestionService;
  }
  onTableCardClicked(cardId, phase) {
    if (phase === _models_card_model__WEBPACK_IMPORTED_MODULE_6__.GamePhase.CHOOSE_COMBINATION) {
      this.gameStateService.selectCombinationCard(cardId);
      return;
    }
    this.gameStateService.clickTableCard(cardId);
  }
  buildSelectableSet(state) {
    const selectable = new Set();
    if (state.phase === _models_card_model__WEBPACK_IMPORTED_MODULE_6__.GamePhase.INITIAL_FOUR) {
      for (const [cardId, cardState] of Object.entries(state.cardStates)) {
        if (cardState === _models_card_model__WEBPACK_IMPORTED_MODULE_6__.CardState.UNKNOWN || cardState === _models_card_model__WEBPACK_IMPORTED_MODULE_6__.CardState.ON_TABLE) {
          selectable.add(cardId);
        }
      }
      return selectable;
    }
    if (state.phase === _models_card_model__WEBPACK_IMPORTED_MODULE_6__.GamePhase.PLAYING) {
      for (const [cardId, cardState] of Object.entries(state.cardStates)) {
        if (state.turn === 'ME' && cardState === _models_card_model__WEBPACK_IMPORTED_MODULE_6__.CardState.IN_MY_HAND) {
          selectable.add(cardId);
        }
        if (state.turn === 'OPPONENT' && cardState === _models_card_model__WEBPACK_IMPORTED_MODULE_6__.CardState.UNKNOWN) {
          selectable.add(cardId);
        }
      }
      return selectable;
    }
    if (!state.pendingPlayedCard) {
      return selectable;
    }
    const pendingCard = _models_card_model__WEBPACK_IMPORTED_MODULE_6__.CARD_BY_ID[state.pendingPlayedCard];
    if (!pendingCard) {
      return selectable;
    }
    const tableCards = state.cardsOnTable.map(id => _models_card_model__WEBPACK_IMPORTED_MODULE_6__.CARD_BY_ID[id]).filter(card => !!card);
    const validCombinations = (0,_utils_combinations_util__WEBPACK_IMPORTED_MODULE_7__.findCombinations)(pendingCard.rank, tableCards);
    for (const combination of validCombinations) {
      for (const card of combination) {
        selectable.add(card.id);
      }
    }
    for (const cardId of state.selectedCombination) {
      selectable.add(cardId);
    }
    return selectable;
  }
  static {
    this.ɵfac = function AppComponent_Factory(t) {
      return new (t || AppComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_services_game_state_service__WEBPACK_IMPORTED_MODULE_8__.GameStateService), _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_services_probability_service__WEBPACK_IMPORTED_MODULE_9__.ProbabilityService), _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdirectiveInject"](_services_ai_suggestion_service__WEBPACK_IMPORTED_MODULE_10__.AISuggestionService));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵdefineComponent"]({
      type: AppComponent,
      selectors: [["app-root"]],
      standalone: true,
      features: [_angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵStandaloneFeature"]],
      decls: 10,
      vars: 6,
      consts: [[1, "app-container"], ["class", "banner-warning", 4, "ngIf"], ["class", "main-content", 4, "ngIf"], [1, "banner-warning"], [1, "main-content"], ["mode", "table", 3, "cardStates", "probabilities", "selectableCardIds", "phase", "cardClicked"]],
      template: function AppComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementStart"](0, "div", 0)(1, "h1");
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtext"](2, "Scopa");
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](3, "app-toolbar")(4, "app-stats-panel");
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](5, AppComponent_div_5_Template, 2, 0, "div", 1);
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵpipe"](6, "async");
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵtemplate"](7, AppComponent_div_7_Template, 7, 4, "div", 2);
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵpipe"](8, "async");
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelement"](9, "app-log-bar");
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵelementEnd"]();
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](5);
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵpipeBind1"](6, 2, ctx.phase$) === ctx.gamePhase.CHOOSE_COMBINATION);
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_11__["ɵɵpipeBind1"](8, 4, ctx.tableVm$));
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_14__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_14__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_14__.AsyncPipe, _components_toolbar_toolbar_component__WEBPACK_IMPORTED_MODULE_1__.ToolbarComponent, _components_stats_panel_stats_panel_component__WEBPACK_IMPORTED_MODULE_2__.StatsPanelComponent, _components_card_grid_card_grid_component__WEBPACK_IMPORTED_MODULE_0__.CardGridComponent, _components_hand_selector_hand_selector_component__WEBPACK_IMPORTED_MODULE_3__.HandSelectorComponent, _components_ai_suggestion_panel_ai_suggestion_panel_component__WEBPACK_IMPORTED_MODULE_4__.AISuggestionPanelComponent, _components_log_bar_log_bar_component__WEBPACK_IMPORTED_MODULE_5__.LogBarComponent],
      styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\nh2[_ngcontent-%COMP%] {\n  margin: 0 0 8px;\n  font-size: 16px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvYXBwLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsY0FBQTtBQUNGOztBQUVBO0VBQ0UsZUFBQTtFQUNBLGVBQUE7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIjpob3N0IHtcclxuICBkaXNwbGF5OiBibG9jaztcclxufVxyXG5cclxuaDIge1xyXG4gIG1hcmdpbjogMCAwIDhweDtcclxuICBmb250LXNpemU6IDE2cHg7XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIifQ== */"]
    });
  }
}

/***/ }),

/***/ 289:
/*!*******************************!*\
  !*** ./src/app/app.config.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   appConfig: () => (/* binding */ appConfig)
/* harmony export */ });
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ 5072);
/* harmony import */ var _app_routes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app.routes */ 2181);



const appConfig = {
  providers: [(0,_angular_router__WEBPACK_IMPORTED_MODULE_1__.provideRouter)(_app_routes__WEBPACK_IMPORTED_MODULE_0__.routes), (0,_angular_common_http__WEBPACK_IMPORTED_MODULE_2__.provideHttpClient)()]
};

/***/ }),

/***/ 2181:
/*!*******************************!*\
  !*** ./src/app/app.routes.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   routes: () => (/* binding */ routes)
/* harmony export */ });
const routes = [];

/***/ }),

/***/ 3593:
/*!*********************************************************************************!*\
  !*** ./src/app/components/ai-suggestion-panel/ai-suggestion-panel.component.ts ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AISuggestionPanelComponent: () => (/* binding */ AISuggestionPanelComponent)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _services_game_state_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../services/game-state.service */ 5236);
/* harmony import */ var _services_ai_suggestion_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/ai-suggestion.service */ 9179);





function AISuggestionPanelComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelement"](0, "div", 6);
  }
}
function AISuggestionPanelComponent_p_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "p", 7);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1, " Configura endpoint backend OpenAI in environment.ts ");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
}
class AISuggestionPanelComponent {
  constructor(gameStateService, aiSuggestionService) {
    this.gameStateService = gameStateService;
    this.aiSuggestionService = aiSuggestionService;
    this.aiSuggestion$ = this.gameStateService.aiSuggestion;
    this.aiLoading$ = this.gameStateService.aiLoading;
  }
  get apiConfigured() {
    return this.aiSuggestionService.isApiConfigured();
  }
  manualQuery() {
    this.aiSuggestionService.manualQuery();
  }
  static {
    this.ɵfac = function AISuggestionPanelComponent_Factory(t) {
      return new (t || AISuggestionPanelComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_game_state_service__WEBPACK_IMPORTED_MODULE_0__.GameStateService), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_ai_suggestion_service__WEBPACK_IMPORTED_MODULE_1__.AISuggestionService));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
      type: AISuggestionPanelComponent,
      selectors: [["app-ai-suggestion-panel"]],
      standalone: true,
      features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵStandaloneFeature"]],
      decls: 11,
      vars: 7,
      consts: [[1, "ai-panel"], [1, "ai-header"], ["class", "spinner", 4, "ngIf"], ["class", "api-note", 4, "ngIf"], [1, "ai-text"], ["type", "button", 1, "ai-btn", 3, "click"], [1, "spinner"], [1, "api-note"]],
      template: function AISuggestionPanelComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 0)(1, "div", 1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](2, "\uD83C\uDF0C\uD83E\uDDE0\u2728\uD83E\uDD16 Suggerimento AI");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](3, AISuggestionPanelComponent_div_3_Template, 1, 0, "div", 2);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](4, "async");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](5, AISuggestionPanelComponent_p_5_Template, 2, 0, "p", 3);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](6, "div", 4);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](7);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](8, "async");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "button", 5);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("click", function AISuggestionPanelComponent_Template_button_click_9_listener() {
            return ctx.manualQuery();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](10, "Chiedi suggerimento");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](4, 3, ctx.aiLoading$));
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", !ctx.apiConfigured);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](8, 5, ctx.aiSuggestion$) || "Nessun suggerimento disponibile");
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_3__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_3__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_3__.AsyncPipe],
      styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n  min-height: 0;\n}\n\n.ai-panel[_ngcontent-%COMP%] {\n  min-height: 360px;\n  height: 100%;\n  max-height: 100%;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  padding: 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  overflow: hidden;\n}\n\n.ai-header[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 700;\n}\n\n.ai-text[_ngcontent-%COMP%] {\n  white-space: pre-wrap;\n  font-size: 14px;\n  line-height: 1.4;\n  flex: 1 1 auto;\n  min-height: 0;\n  overflow-y: auto;\n  padding-right: 4px;\n}\n\n.ai-btn[_ngcontent-%COMP%] {\n  padding: 10px 14px;\n  border: 1px solid #000;\n  background: #fff;\n  font-weight: 700;\n  border-radius: 8px;\n  cursor: pointer;\n  align-self: flex-start;\n}\n\n.api-note[_ngcontent-%COMP%] {\n  margin: 0;\n  color: #666;\n  font-style: italic;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9haS1zdWdnZXN0aW9uLXBhbmVsL2FpLXN1Z2dlc3Rpb24tcGFuZWwuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxjQUFBO0VBQ0EsWUFBQTtFQUNBLGFBQUE7QUFDRjs7QUFFQTtFQUNFLGlCQUFBO0VBQ0EsWUFBQTtFQUNBLGdCQUFBO0VBQ0Esc0JBQUE7RUFDQSxrQkFBQTtFQUNBLGFBQUE7RUFDQSxhQUFBO0VBQ0Esc0JBQUE7RUFDQSxTQUFBO0VBQ0EsZ0JBQUE7QUFDRjs7QUFFQTtFQUNFLGVBQUE7RUFDQSxnQkFBQTtBQUNGOztBQUVBO0VBQ0UscUJBQUE7RUFDQSxlQUFBO0VBQ0EsZ0JBQUE7RUFDQSxjQUFBO0VBQ0EsYUFBQTtFQUNBLGdCQUFBO0VBQ0Esa0JBQUE7QUFDRjs7QUFFQTtFQUNFLGtCQUFBO0VBQ0Esc0JBQUE7RUFDQSxnQkFBQTtFQUNBLGdCQUFBO0VBQ0Esa0JBQUE7RUFDQSxlQUFBO0VBQ0Esc0JBQUE7QUFDRjs7QUFFQTtFQUNFLFNBQUE7RUFDQSxXQUFBO0VBQ0Esa0JBQUE7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIjpob3N0IHtcbiAgZGlzcGxheTogYmxvY2s7XG4gIGhlaWdodDogMTAwJTtcbiAgbWluLWhlaWdodDogMDtcbn1cblxuLmFpLXBhbmVsIHtcbiAgbWluLWhlaWdodDogMzYwcHg7XG4gIGhlaWdodDogMTAwJTtcbiAgbWF4LWhlaWdodDogMTAwJTtcbiAgYm9yZGVyOiAxcHggc29saWQgI2RkZDtcbiAgYm9yZGVyLXJhZGl1czogOHB4O1xuICBwYWRkaW5nOiAxNnB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDEycHg7XG4gIG92ZXJmbG93OiBoaWRkZW47XG59XG5cclxuLmFpLWhlYWRlciB7XHJcbiAgZm9udC1zaXplOiAxNnB4O1xyXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XHJcbn1cclxuXHJcbi5haS10ZXh0IHtcbiAgd2hpdGUtc3BhY2U6IHByZS13cmFwO1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxLjQ7XG4gIGZsZXg6IDEgMSBhdXRvO1xuICBtaW4taGVpZ2h0OiAwO1xuICBvdmVyZmxvdy15OiBhdXRvO1xuICBwYWRkaW5nLXJpZ2h0OiA0cHg7XG59XG5cclxuLmFpLWJ0biB7XHJcbiAgcGFkZGluZzogMTBweCAxNHB4O1xyXG4gIGJvcmRlcjogMXB4IHNvbGlkICMwMDA7XHJcbiAgYmFja2dyb3VuZDogI2ZmZjtcclxuICBmb250LXdlaWdodDogNzAwO1xyXG4gIGJvcmRlci1yYWRpdXM6IDhweDtcclxuICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgYWxpZ24tc2VsZjogZmxleC1zdGFydDtcclxufVxyXG5cclxuLmFwaS1ub3RlIHtcclxuICBtYXJnaW46IDA7XHJcbiAgY29sb3I6ICM2NjY7XHJcbiAgZm9udC1zdHlsZTogaXRhbGljO1xyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
    });
  }
}

/***/ }),

/***/ 7133:
/*!*************************************************************!*\
  !*** ./src/app/components/card-cell/card-cell.component.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CardCellComponent: () => (/* binding */ CardCellComponent)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _models_card_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../models/card.model */ 1512);





function CardCellComponent_span_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "span", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassProp"]("sub-mine", ctx_r0.state === ctx_r0.cardState.IN_MY_HAND);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" ", ctx_r0.subText, " ");
  }
}
class CardCellComponent {
  constructor() {
    this.probability = null;
    this.mode = 'table';
    this.selectable = true;
    this.blockedCapture = false;
    this.clicked = new _angular_core__WEBPACK_IMPORTED_MODULE_1__.EventEmitter();
    this.cardState = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState;
  }
  onClick() {
    if (this.state === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.PLAYED) {
      return;
    }
    if (!this.selectable) {
      return;
    }
    this.clicked.emit();
  }
  get mainText() {
    if (this.state === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.PLAYED) {
      return '\u2713';
    }
    return `${this.card.rank}`;
  }
  get subText() {
    if (this.state === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.IN_MY_HAND) {
      return 'mia';
    }
    if (this.state === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN && this.mode === 'table' && this.probability !== null) {
      return `${Math.round(this.probability * 100)}%`;
    }
    return '';
  }
  get showSubText() {
    if (this.state === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.IN_MY_HAND) {
      return true;
    }
    return this.state === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN && this.mode === 'table' && this.probability !== null;
  }
  static {
    this.ɵfac = function CardCellComponent_Factory(t) {
      return new (t || CardCellComponent)();
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
      type: CardCellComponent,
      selectors: [["app-card-cell"]],
      inputs: {
        card: "card",
        state: "state",
        probability: "probability",
        mode: "mode",
        selectable: "selectable",
        blockedCapture: "blockedCapture"
      },
      outputs: {
        clicked: "clicked"
      },
      standalone: true,
      features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵStandaloneFeature"]],
      decls: 4,
      vars: 22,
      consts: [["type", "button", 1, "cell-button", 3, "click"], [1, "cell-main"], ["class", "cell-sub", 3, "sub-mine", 4, "ngIf"], [1, "cell-sub"]],
      template: function CardCellComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 0);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function CardCellComponent_Template_button_click_0_listener() {
            return ctx.onClick();
          });
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "span", 1);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](3, CardCellComponent_span_3_Template, 2, 3, "span", 2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassProp"]("table-mode", ctx.mode === "table")("hand-mode", ctx.mode === "hand")("state-unknown", ctx.state === ctx.cardState.UNKNOWN)("state-in-my-hand", ctx.state === ctx.cardState.IN_MY_HAND)("state-on-table", ctx.state === ctx.cardState.ON_TABLE)("state-on-table-blinking", ctx.state === ctx.cardState.ON_TABLE_BLINKING)("state-played", ctx.state === ctx.cardState.PLAYED)("state-combination-candidate", ctx.state === ctx.cardState.COMBINATION_CANDIDATE)("not-selectable", !ctx.selectable && ctx.state !== ctx.cardState.PLAYED && ctx.state !== ctx.cardState.ON_TABLE_BLINKING)("blocked-capture", ctx.blockedCapture);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate"](ctx.mainText);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](1);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", ctx.showSubText);
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_2__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_2__.NgIf],
      styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.cell-button[_ngcontent-%COMP%] {\n  width: 100%;\n  border: 0;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 2px;\n  background: #fff;\n  cursor: pointer;\n  -webkit-tap-highlight-color: transparent;\n}\n\n.cell-button.table-mode[_ngcontent-%COMP%] {\n  height: 52px;\n}\n\n.cell-button.hand-mode[_ngcontent-%COMP%] {\n  height: 44px;\n}\n\n.cell-main[_ngcontent-%COMP%] {\n  font-size: 18px;\n  font-weight: 700;\n  line-height: 1;\n}\n\n.cell-sub[_ngcontent-%COMP%] {\n  font-size: 11px;\n  opacity: 0.8;\n  line-height: 1;\n}\n\n.sub-mine[_ngcontent-%COMP%] {\n  color: #1a73e8;\n  opacity: 1;\n}\n\n.state-unknown[_ngcontent-%COMP%] {\n  background: #fff;\n}\n\n.state-in-my-hand[_ngcontent-%COMP%] {\n  background: #e8f0fe;\n  outline: 2px solid #1a73e8;\n}\n\n.state-on-table[_ngcontent-%COMP%] {\n  background: #fff;\n  outline: 2px solid #e00;\n}\n\n.state-on-table-blinking[_ngcontent-%COMP%] {\n  background: #fff;\n  outline: 2px solid #e00;\n  animation: blink-red-border 800ms infinite;\n  cursor: default;\n}\n\n.state-played[_ngcontent-%COMP%] {\n  background: #c0c0c0;\n  cursor: not-allowed;\n}\n\n.state-combination-candidate[_ngcontent-%COMP%] {\n  background: #fff;\n  outline: 2px solid #e00;\n  animation: blink-red-border 800ms infinite;\n}\n\n.not-selectable[_ngcontent-%COMP%] {\n  opacity: 0.4;\n  pointer-events: none;\n  background: #e8e8e8;\n}\n\n.cell-button.blocked-capture[_ngcontent-%COMP%] {\n  background: #d6c2ff;\n  outline: 2px solid #7a3fe0;\n}\n\n.cell-button.blocked-capture.not-selectable[_ngcontent-%COMP%] {\n  opacity: 0.85;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9jYXJkLWNlbGwvY2FyZC1jZWxsLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsY0FBQTtBQUNGOztBQUVBO0VBQ0UsV0FBQTtFQUNBLFNBQUE7RUFDQSxTQUFBO0VBQ0EsVUFBQTtFQUNBLGFBQUE7RUFDQSxzQkFBQTtFQUNBLG1CQUFBO0VBQ0EsdUJBQUE7RUFDQSxRQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0Esd0NBQUE7QUFDRjs7QUFFQTtFQUNFLFlBQUE7QUFDRjs7QUFFQTtFQUNFLFlBQUE7QUFDRjs7QUFFQTtFQUNFLGVBQUE7RUFDQSxnQkFBQTtFQUNBLGNBQUE7QUFDRjs7QUFFQTtFQUNFLGVBQUE7RUFDQSxZQUFBO0VBQ0EsY0FBQTtBQUNGOztBQUVBO0VBQ0UsY0FBQTtFQUNBLFVBQUE7QUFDRjs7QUFFQTtFQUNFLGdCQUFBO0FBQ0Y7O0FBRUE7RUFDRSxtQkFBQTtFQUNBLDBCQUFBO0FBQ0Y7O0FBRUE7RUFDRSxnQkFBQTtFQUNBLHVCQUFBO0FBQ0Y7O0FBRUE7RUFDRSxnQkFBQTtFQUNBLHVCQUFBO0VBQ0EsMENBQUE7RUFDQSxlQUFBO0FBQ0Y7O0FBRUE7RUFDRSxtQkFBQTtFQUNBLG1CQUFBO0FBQ0Y7O0FBRUE7RUFDRSxnQkFBQTtFQUNBLHVCQUFBO0VBQ0EsMENBQUE7QUFDRjs7QUFFQTtFQUNFLFlBQUE7RUFDQSxvQkFBQTtFQUNBLG1CQUFBO0FBQ0Y7O0FBRUE7RUFDRSxtQkFBQTtFQUNBLDBCQUFBO0FBQ0Y7O0FBRUE7RUFDRSxhQUFBO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyI6aG9zdCB7XHJcbiAgZGlzcGxheTogYmxvY2s7XHJcbn1cclxuXHJcbi5jZWxsLWJ1dHRvbiB7XHJcbiAgd2lkdGg6IDEwMCU7XHJcbiAgYm9yZGVyOiAwO1xyXG4gIG1hcmdpbjogMDtcclxuICBwYWRkaW5nOiAwO1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xyXG4gIGdhcDogMnB4O1xyXG4gIGJhY2tncm91bmQ6ICNmZmY7XHJcbiAgY3Vyc29yOiBwb2ludGVyO1xyXG4gIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XHJcbn1cclxuXHJcbi5jZWxsLWJ1dHRvbi50YWJsZS1tb2RlIHtcclxuICBoZWlnaHQ6IDUycHg7XHJcbn1cclxuXHJcbi5jZWxsLWJ1dHRvbi5oYW5kLW1vZGUge1xyXG4gIGhlaWdodDogNDRweDtcclxufVxyXG5cclxuLmNlbGwtbWFpbiB7XHJcbiAgZm9udC1zaXplOiAxOHB4O1xyXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XHJcbiAgbGluZS1oZWlnaHQ6IDE7XHJcbn1cclxuXHJcbi5jZWxsLXN1YiB7XHJcbiAgZm9udC1zaXplOiAxMXB4O1xyXG4gIG9wYWNpdHk6IDAuODtcclxuICBsaW5lLWhlaWdodDogMTtcclxufVxyXG5cclxuLnN1Yi1taW5lIHtcclxuICBjb2xvcjogIzFhNzNlODtcclxuICBvcGFjaXR5OiAxO1xyXG59XHJcblxyXG4uc3RhdGUtdW5rbm93biB7XHJcbiAgYmFja2dyb3VuZDogI2ZmZjtcclxufVxyXG5cclxuLnN0YXRlLWluLW15LWhhbmQge1xyXG4gIGJhY2tncm91bmQ6ICNlOGYwZmU7XHJcbiAgb3V0bGluZTogMnB4IHNvbGlkICMxYTczZTg7XHJcbn1cclxuXHJcbi5zdGF0ZS1vbi10YWJsZSB7XHJcbiAgYmFja2dyb3VuZDogI2ZmZjtcclxuICBvdXRsaW5lOiAycHggc29saWQgI2UwMDtcclxufVxyXG5cclxuLnN0YXRlLW9uLXRhYmxlLWJsaW5raW5nIHtcclxuICBiYWNrZ3JvdW5kOiAjZmZmO1xyXG4gIG91dGxpbmU6IDJweCBzb2xpZCAjZTAwO1xyXG4gIGFuaW1hdGlvbjogYmxpbmstcmVkLWJvcmRlciA4MDBtcyBpbmZpbml0ZTtcclxuICBjdXJzb3I6IGRlZmF1bHQ7XHJcbn1cclxuXHJcbi5zdGF0ZS1wbGF5ZWQge1xyXG4gIGJhY2tncm91bmQ6ICNjMGMwYzA7XHJcbiAgY3Vyc29yOiBub3QtYWxsb3dlZDtcclxufVxyXG5cclxuLnN0YXRlLWNvbWJpbmF0aW9uLWNhbmRpZGF0ZSB7XHJcbiAgYmFja2dyb3VuZDogI2ZmZjtcclxuICBvdXRsaW5lOiAycHggc29saWQgI2UwMDtcclxuICBhbmltYXRpb246IGJsaW5rLXJlZC1ib3JkZXIgODAwbXMgaW5maW5pdGU7XHJcbn1cclxuXHJcbi5ub3Qtc2VsZWN0YWJsZSB7XG4gIG9wYWNpdHk6IDAuNDtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIGJhY2tncm91bmQ6ICNlOGU4ZTg7XG59XG5cbi5jZWxsLWJ1dHRvbi5ibG9ja2VkLWNhcHR1cmUge1xuICBiYWNrZ3JvdW5kOiAjZDZjMmZmO1xuICBvdXRsaW5lOiAycHggc29saWQgIzdhM2ZlMDtcbn1cblxuLmNlbGwtYnV0dG9uLmJsb2NrZWQtY2FwdHVyZS5ub3Qtc2VsZWN0YWJsZSB7XG4gIG9wYWNpdHk6IDAuODU7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
    });
  }
}

/***/ }),

/***/ 569:
/*!*************************************************************!*\
  !*** ./src/app/components/card-grid/card-grid.component.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CardGridComponent: () => (/* binding */ CardGridComponent)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _models_card_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../models/card.model */ 1512);
/* harmony import */ var _card_cell_card_cell_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../card-cell/card-cell.component */ 7133);






function CardGridComponent_th_3_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const suit_r2 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate"](suit_r2);
  }
}
function CardGridComponent_tr_5_td_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r9 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerStart"](0);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](1, "app-card-cell", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵlistener"]("clicked", function CardGridComponent_tr_5_td_1_ng_container_1_Template_app_card_cell_clicked_1_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵrestoreView"](_r9);
      const card_r7 = restoredCtx.ngIf;
      const ctx_r8 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](3);
      return _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵresetView"](ctx_r8.onCardClick(card_r7.id));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementContainerEnd"]();
  }
  if (rf & 2) {
    const card_r7 = ctx.ngIf;
    const rank_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"](2).$implicit;
    const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("card", card_r7)("state", ctx_r6.getState(card_r7.id))("probability", ctx_r6.getProbability(rank_r3))("mode", ctx_r6.mode)("selectable", ctx_r6.isSelectable(card_r7.id))("blockedCapture", ctx_r6.mode === "table" && ctx_r6.phase === ctx_r6.gamePhase.CHOOSE_COMBINATION && ctx_r6.getState(card_r7.id) === ctx_r6.cardState.ON_TABLE && !ctx_r6.isSelectable(card_r7.id));
  }
}
function CardGridComponent_tr_5_td_1_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](1, CardGridComponent_tr_5_td_1_ng_container_1_Template, 2, 6, "ng-container", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const suit_r5 = ctx.$implicit;
    const rank_r3 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]().$implicit;
    const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", ctx_r4.getCard(suit_r5, rank_r3));
  }
}
function CardGridComponent_tr_5_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "tr");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](1, CardGridComponent_tr_5_td_1_Template, 2, 1, "td", 1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx_r1.suits)("ngForTrackBy", ctx_r1.trackBySuit);
  }
}
class CardGridComponent {
  constructor() {
    this.mode = 'table';
    this.cardStates = {};
    this.probabilities = {};
    this.selectableCardIds = new Set();
    this.phase = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.INITIAL_FOUR;
    this.cardClicked = new _angular_core__WEBPACK_IMPORTED_MODULE_2__.EventEmitter();
    this.suits = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.SUITS;
    this.ranks = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.RANKS;
    this.cardState = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState;
    this.gamePhase = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase;
  }
  trackByRank(_, rank) {
    return rank;
  }
  trackBySuit(_, suit) {
    return suit;
  }
  getCard(suit, rank) {
    return {
      id: (0,_models_card_model__WEBPACK_IMPORTED_MODULE_0__.createCardId)(suit, rank),
      suit,
      rank
    };
  }
  getState(cardId) {
    return this.cardStates[cardId] ?? _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN;
  }
  getProbability(rank) {
    if (this.mode !== 'table') {
      return null;
    }
    return this.probabilities[rank] ?? 0;
  }
  isSelectable(cardId) {
    return this.selectableCardIds.has(cardId);
  }
  onCardClick(cardId) {
    this.cardClicked.emit(cardId);
  }
  static {
    this.ɵfac = function CardGridComponent_Factory(t) {
      return new (t || CardGridComponent)();
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
      type: CardGridComponent,
      selectors: [["app-card-grid"]],
      inputs: {
        mode: "mode",
        cardStates: "cardStates",
        probabilities: "probabilities",
        selectableCardIds: "selectableCardIds",
        phase: "phase"
      },
      outputs: {
        cardClicked: "cardClicked"
      },
      standalone: true,
      features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵStandaloneFeature"]],
      decls: 6,
      vars: 4,
      consts: [[1, "card-grid"], [4, "ngFor", "ngForOf", "ngForTrackBy"], [4, "ngIf"], [3, "card", "state", "probability", "mode", "selectable", "blockedCapture", "clicked"]],
      template: function CardGridComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "table", 0)(1, "thead")(2, "tr");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](3, CardGridComponent_th_3_Template, 2, 1, "th", 1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](4, "tbody");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](5, CardGridComponent_tr_5_Template, 2, 2, "tr", 1);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx.suits)("ngForTrackBy", ctx.trackBySuit);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngForOf", ctx.ranks)("ngForTrackBy", ctx.trackByRank);
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_3__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_3__.NgForOf, _angular_common__WEBPACK_IMPORTED_MODULE_3__.NgIf, _card_cell_card_cell_component__WEBPACK_IMPORTED_MODULE_1__.CardCellComponent],
      styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.card-grid[_ngcontent-%COMP%] {\n  border-collapse: collapse;\n  width: 100%;\n  table-layout: fixed;\n}\n\n.card-grid[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], .card-grid[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  border: 1px solid #000;\n  text-align: center;\n  padding: 0;\n}\n\n.card-grid[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 700;\n  padding: 8px 4px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9jYXJkLWdyaWQvY2FyZC1ncmlkLmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsY0FBQTtBQUNGOztBQUVBO0VBQ0UseUJBQUE7RUFDQSxXQUFBO0VBQ0EsbUJBQUE7QUFDRjs7QUFFQTs7RUFFRSxzQkFBQTtFQUNBLGtCQUFBO0VBQ0EsVUFBQTtBQUNGOztBQUVBO0VBQ0UsZUFBQTtFQUNBLGdCQUFBO0VBQ0EsZ0JBQUE7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIjpob3N0IHtcclxuICBkaXNwbGF5OiBibG9jaztcclxufVxyXG5cclxuLmNhcmQtZ3JpZCB7XHJcbiAgYm9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcclxuICB3aWR0aDogMTAwJTtcclxuICB0YWJsZS1sYXlvdXQ6IGZpeGVkO1xyXG59XHJcblxyXG4uY2FyZC1ncmlkIHRoLFxyXG4uY2FyZC1ncmlkIHRkIHtcclxuICBib3JkZXI6IDFweCBzb2xpZCAjMDAwO1xyXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcclxuICBwYWRkaW5nOiAwO1xyXG59XHJcblxyXG4uY2FyZC1ncmlkIHRoIHtcclxuICBmb250LXNpemU6IDE0cHg7XHJcbiAgZm9udC13ZWlnaHQ6IDcwMDtcclxuICBwYWRkaW5nOiA4cHggNHB4O1xyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
    });
  }
}

/***/ }),

/***/ 6765:
/*!*********************************************************************!*\
  !*** ./src/app/components/hand-selector/hand-selector.component.ts ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HandSelectorComponent: () => (/* binding */ HandSelectorComponent)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 271);
/* harmony import */ var _models_card_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../models/card.model */ 1512);
/* harmony import */ var _card_grid_card_grid_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../card-grid/card-grid.component */ 569);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _services_game_state_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/game-state.service */ 5236);







function HandSelectorComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](0, "div", 1)(1, "h2");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementStart"](3, "app-card-grid", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵlistener"]("cardClicked", function HandSelectorComponent_div_0_Template_app_card_grid_cardClicked_3_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵrestoreView"](_r3);
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵresetView"](ctx_r2.onCardClicked($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](4, "async");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const vm_r1 = ctx.ngIf;
    const ctx_r0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵnextContext"]();
    let tmp_4_0;
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtextInterpolate1"]("La mia mano (", vm_r1.myHandCount, "/3)");
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵadvance"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("cardStates", vm_r1.cardStates)("probabilities", ctx_r0.emptyProbabilities)("selectableCardIds", vm_r1.selectableCardIds)("phase", (tmp_4_0 = _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](4, 5, ctx_r0.phase$)) !== null && tmp_4_0 !== undefined ? tmp_4_0 : ctx_r0.initialPhase);
  }
}
class HandSelectorComponent {
  constructor(gameStateService) {
    this.gameStateService = gameStateService;
    this.emptyProbabilities = {};
    this.initialPhase = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.INITIAL_FOUR;
    this.vm$ = this.gameStateService.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => {
      const selectableCardIds = new Set();
      for (const [cardId, cardState] of Object.entries(state.cardStates)) {
        if (cardState === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN || cardState === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.IN_MY_HAND) {
          selectableCardIds.add(cardId);
        }
      }
      return {
        cardStates: state.cardStates,
        myHandCount: state.myHand.length,
        selectableCardIds
      };
    }));
    this.phase$ = this.gameStateService.phase;
  }
  onCardClicked(cardId) {
    this.gameStateService.clickHandCard(cardId);
  }
  static {
    this.ɵfac = function HandSelectorComponent_Factory(t) {
      return new (t || HandSelectorComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdirectiveInject"](_services_game_state_service__WEBPACK_IMPORTED_MODULE_2__.GameStateService));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵdefineComponent"]({
      type: HandSelectorComponent,
      selectors: [["app-hand-selector"]],
      standalone: true,
      features: [_angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵStandaloneFeature"]],
      decls: 2,
      vars: 3,
      consts: [["class", "hand-wrap", 4, "ngIf"], [1, "hand-wrap"], ["mode", "hand", 3, "cardStates", "probabilities", "selectableCardIds", "phase", "cardClicked"]],
      template: function HandSelectorComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵtemplate"](0, HandSelectorComponent_div_0_Template, 5, 7, "div", 0);
          _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipe"](1, "async");
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_3__["ɵɵpipeBind1"](1, 1, ctx.vm$));
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_5__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_5__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_5__.AsyncPipe, _card_grid_card_grid_component__WEBPACK_IMPORTED_MODULE_1__.CardGridComponent],
      styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\nh2[_ngcontent-%COMP%] {\n  margin: 0 0 8px;\n  font-size: 16px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9oYW5kLXNlbGVjdG9yL2hhbmQtc2VsZWN0b3IuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxjQUFBO0FBQ0Y7O0FBRUE7RUFDRSxlQUFBO0VBQ0EsZUFBQTtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiOmhvc3Qge1xyXG4gIGRpc3BsYXk6IGJsb2NrO1xyXG59XHJcblxyXG5oMiB7XHJcbiAgbWFyZ2luOiAwIDAgOHB4O1xyXG4gIGZvbnQtc2l6ZTogMTZweDtcclxufVxyXG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
    });
  }
}

/***/ }),

/***/ 6529:
/*!*********************************************************!*\
  !*** ./src/app/components/log-bar/log-bar.component.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LogBarComponent: () => (/* binding */ LogBarComponent)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ 271);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _services_game_state_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../services/game-state.service */ 5236);





class LogBarComponent {
  constructor(gameStateService) {
    this.gameStateService = gameStateService;
    this.logText$ = this.gameStateService.lastPlayLog.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_1__.map)(value => value || 'Nessuna giocata ancora'));
  }
  static {
    this.ɵfac = function LogBarComponent_Factory(t) {
      return new (t || LogBarComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_game_state_service__WEBPACK_IMPORTED_MODULE_0__.GameStateService));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
      type: LogBarComponent,
      selectors: [["app-log-bar"]],
      standalone: true,
      features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵStandaloneFeature"]],
      decls: 5,
      vars: 3,
      consts: [[1, "log-bar"]],
      template: function LogBarComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 0)(1, "strong");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](2, "Ultima giocata:");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](4, "async");
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](3);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](4, 1, ctx.logText$), "\n");
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_3__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_3__.AsyncPipe],
      styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.log-bar[_ngcontent-%COMP%] {\n  background: #f5f5f5;\n  padding: 10px 16px;\n  border-radius: 8px;\n  margin-top: 12px;\n  font-size: 14px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9sb2ctYmFyL2xvZy1iYXIuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxjQUFBO0FBQ0Y7O0FBRUE7RUFDRSxtQkFBQTtFQUNBLGtCQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIjpob3N0IHtcclxuICBkaXNwbGF5OiBibG9jaztcclxufVxyXG5cclxuLmxvZy1iYXIge1xyXG4gIGJhY2tncm91bmQ6ICNmNWY1ZjU7XHJcbiAgcGFkZGluZzogMTBweCAxNnB4O1xyXG4gIGJvcmRlci1yYWRpdXM6IDhweDtcclxuICBtYXJnaW4tdG9wOiAxMnB4O1xyXG4gIGZvbnQtc2l6ZTogMTRweDtcclxufVxyXG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
    });
  }
}

/***/ }),

/***/ 9245:
/*!*****************************************************************!*\
  !*** ./src/app/components/stats-panel/stats-panel.component.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StatsPanelComponent: () => (/* binding */ StatsPanelComponent)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 271);
/* harmony import */ var _models_card_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../models/card.model */ 1512);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _services_game_state_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/game-state.service */ 5236);






function StatsPanelComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](0, "div", 1)(1, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](3, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](5, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](6);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](7, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](9, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](10);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](11, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](13, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](15, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementStart"](17, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtext"](18);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const stats_r1 = ctx.ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"]("Denari: ", stats_r1.denariPlayed, "/10");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"]("Coppe: ", stats_r1.coppePlayed, "/10");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"]("Spade: ", stats_r1.spadePlayed, "/10");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"]("Bastoni: ", stats_r1.bastoniPlayed, "/10");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"]("Totale uscite: ", stats_r1.totalPlayed, "/40");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"]("Rimaste: ", stats_r1.remaining, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"]("Prese tue: ", stats_r1.myCaptured, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"]("Prese avversario: ", stats_r1.opponentCaptured, "");
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtextInterpolate1"]("Fase: ", stats_r1.phaseLabel, "");
  }
}
class StatsPanelComponent {
  constructor(gameStateService) {
    this.gameStateService = gameStateService;
    this.stats$ = this.gameStateService.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_3__.map)(state => {
      const playedIds = Object.entries(state.cardStates).filter(([, cardState]) => cardState === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.PLAYED).map(([cardId]) => cardId);
      const denariPlayed = playedIds.map(cardId => _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[cardId]).filter(card => card?.suit === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.Suit.Denari).length;
      const coppePlayed = playedIds.map(cardId => _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[cardId]).filter(card => card?.suit === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.Suit.Coppe).length;
      const spadePlayed = playedIds.map(cardId => _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[cardId]).filter(card => card?.suit === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.Suit.Spade).length;
      const bastoniPlayed = playedIds.map(cardId => _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[cardId]).filter(card => card?.suit === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.Suit.Bastoni).length;
      const totalPlayed = playedIds.length;
      return {
        denariPlayed,
        coppePlayed,
        spadePlayed,
        bastoniPlayed,
        totalPlayed,
        remaining: 40 - totalPlayed,
        myCaptured: state.myCapturedCards.length,
        opponentCaptured: state.opponentCapturedCards.length,
        phaseLabel: this.toPhaseLabel(state.phase)
      };
    }));
  }
  toPhaseLabel(phase) {
    if (phase === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.INITIAL_FOUR) {
      return 'Carte iniziali';
    }
    if (phase === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.PLAYING) {
      return 'In gioco';
    }
    return 'Scegli combinazione';
  }
  static {
    this.ɵfac = function StatsPanelComponent_Factory(t) {
      return new (t || StatsPanelComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdirectiveInject"](_services_game_state_service__WEBPACK_IMPORTED_MODULE_1__.GameStateService));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineComponent"]({
      type: StatsPanelComponent,
      selectors: [["app-stats-panel"]],
      standalone: true,
      features: [_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵStandaloneFeature"]],
      decls: 2,
      vars: 3,
      consts: [["class", "stats-row", 4, "ngIf"], [1, "stats-row"]],
      template: function StatsPanelComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵtemplate"](0, StatsPanelComponent_div_0_Template, 19, 9, "div", 0);
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipe"](1, "async");
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵpipeBind1"](1, 1, ctx.stats$));
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_4__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_4__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_4__.AsyncPipe],
      styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.stats-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 18px;\n  flex-wrap: wrap;\n  align-items: center;\n  font-size: 14px;\n  margin-top: 8px;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy9zdGF0cy1wYW5lbC9zdGF0cy1wYW5lbC5jb21wb25lbnQuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGNBQUE7QUFDRjs7QUFFQTtFQUNFLGFBQUE7RUFDQSxTQUFBO0VBQ0EsZUFBQTtFQUNBLG1CQUFBO0VBQ0EsZUFBQTtFQUNBLGVBQUE7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIjpob3N0IHtcclxuICBkaXNwbGF5OiBibG9jaztcclxufVxyXG5cclxuLnN0YXRzLXJvdyB7XHJcbiAgZGlzcGxheTogZmxleDtcclxuICBnYXA6IDE4cHg7XHJcbiAgZmxleC13cmFwOiB3cmFwO1xyXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XHJcbiAgZm9udC1zaXplOiAxNHB4O1xyXG4gIG1hcmdpbi10b3A6IDhweDtcclxufVxyXG4iXSwic291cmNlUm9vdCI6IiJ9 */"]
    });
  }
}

/***/ }),

/***/ 2305:
/*!*********************************************************!*\
  !*** ./src/app/components/toolbar/toolbar.component.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ToolbarComponent: () => (/* binding */ ToolbarComponent)
/* harmony export */ });
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 271);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _services_game_state_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../services/game-state.service */ 5236);





function ToolbarComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 1)(1, "button", 2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function ToolbarComponent_div_0_Template_button_click_1_listener() {
      const restoredCtx = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r3);
      const vm_r1 = restoredCtx.ngIf;
      const ctx_r2 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r2.cycleOpponentCards(vm_r1.opponent));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "button", 3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function ToolbarComponent_div_0_Template_button_click_3_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r3);
      const ctx_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r4.reset());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](4, "Reset");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](5, "button", 4);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function ToolbarComponent_div_0_Template_button_click_5_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r3);
      const ctx_r5 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r5.undo());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](6, " \u21A9 Undo ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](7, "button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function ToolbarComponent_div_0_Template_button_click_7_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r3);
      const ctx_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r6.setTurn("ME"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](8, " Tu ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](9, "button", 5);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function ToolbarComponent_div_0_Template_button_click_9_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵrestoreView"](_r3);
      const ctx_r7 = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵresetView"](ctx_r7.setTurn("OPPONENT"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](10, " Avversario ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const vm_r1 = ctx.ngIf;
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtextInterpolate1"](" Carte avversario: ", vm_r1.opponent, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("disabled", !vm_r1.canUndo);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassProp"]("active", vm_r1.turn === "ME");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("disabled", vm_r1.turn !== null);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵclassProp"]("active", vm_r1.turn === "OPPONENT");
    _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("disabled", vm_r1.turn !== null);
  }
}
const _c0 = function (a0, a1, a2) {
  return {
    opponent: a0,
    turn: a1,
    canUndo: a2
  };
};
class ToolbarComponent {
  constructor(gameStateService) {
    this.gameStateService = gameStateService;
    this.opponentCardCount$ = this.gameStateService.opponentCardCount;
    this.turn$ = this.gameStateService.turn;
    this.canUndo$ = this.gameStateService.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_2__.map)(state => state.history.length > 0));
  }
  cycleOpponentCards(current) {
    if (current === null) {
      return;
    }
    const next = current === 3 ? 2 : current === 2 ? 1 : 3;
    this.gameStateService.setOpponentCardCount(next);
  }
  reset() {
    const confirmed = window.confirm('Confermi il reset della partita?');
    if (!confirmed) {
      return;
    }
    this.gameStateService.reset();
  }
  undo() {
    this.gameStateService.undo();
  }
  setTurn(turn) {
    this.gameStateService.setTurn(turn);
  }
  static {
    this.ɵfac = function ToolbarComponent_Factory(t) {
      return new (t || ToolbarComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_services_game_state_service__WEBPACK_IMPORTED_MODULE_0__.GameStateService));
    };
  }
  static {
    this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({
      type: ToolbarComponent,
      selectors: [["app-toolbar"]],
      standalone: true,
      features: [_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵStandaloneFeature"]],
      decls: 4,
      vars: 11,
      consts: [["class", "toolbar-row", 4, "ngIf"], [1, "toolbar-row"], ["type", "button", 1, "toolbar-btn", 3, "click"], ["type", "button", 1, "toolbar-btn", "reset-btn", 3, "click"], ["type", "button", 1, "toolbar-btn", 3, "disabled", "click"], ["type", "button", 1, "toolbar-btn", "turn-btn", 3, "disabled", "click"]],
      template: function ToolbarComponent_Template(rf, ctx) {
        if (rf & 1) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtemplate"](0, ToolbarComponent_div_0_Template, 11, 8, "div", 0);
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](1, "async");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](2, "async");
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipe"](3, "async");
        }
        if (rf & 2) {
          _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵproperty"]("ngIf", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpureFunction3"](7, _c0, _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](1, 1, ctx.opponentCardCount$), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](2, 3, ctx.turn$), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵpipeBind1"](3, 5, ctx.canUndo$)));
        }
      },
      dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_3__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_3__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_3__.AsyncPipe],
      styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.toolbar-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 10px;\n  flex-wrap: wrap;\n  align-items: center;\n}\n\n.toolbar-btn[_ngcontent-%COMP%] {\n  padding: 10px 14px;\n  border: 1px solid #000;\n  background: #fff;\n  font-weight: 700;\n  border-radius: 8px;\n  min-height: 40px;\n  cursor: pointer;\n}\n\n.toolbar-btn[_ngcontent-%COMP%]:disabled {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n\n.reset-btn[_ngcontent-%COMP%]:hover {\n  border-color: #e00;\n}\n\n.turn-btn[_ngcontent-%COMP%] {\n  min-width: 100px;\n}\n\n.turn-btn.active[_ngcontent-%COMP%] {\n  background: #4caf50;\n  color: #fff;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90b29sYmFyL3Rvb2xiYXIuY29tcG9uZW50LnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxjQUFBO0FBQ0Y7O0FBRUE7RUFDRSxhQUFBO0VBQ0EsU0FBQTtFQUNBLGVBQUE7RUFDQSxtQkFBQTtBQUNGOztBQUVBO0VBQ0Usa0JBQUE7RUFDQSxzQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtBQUNGOztBQUVBO0VBQ0UsWUFBQTtFQUNBLG1CQUFBO0FBQ0Y7O0FBRUE7RUFDRSxrQkFBQTtBQUNGOztBQUVBO0VBQ0UsZ0JBQUE7QUFDRjs7QUFFQTtFQUNFLG1CQUFBO0VBQ0EsV0FBQTtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiOmhvc3Qge1xyXG4gIGRpc3BsYXk6IGJsb2NrO1xyXG59XHJcblxyXG4udG9vbGJhci1yb3cge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZ2FwOiAxMHB4O1xyXG4gIGZsZXgtd3JhcDogd3JhcDtcclxuICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG59XHJcblxyXG4udG9vbGJhci1idG4ge1xyXG4gIHBhZGRpbmc6IDEwcHggMTRweDtcclxuICBib3JkZXI6IDFweCBzb2xpZCAjMDAwO1xyXG4gIGJhY2tncm91bmQ6ICNmZmY7XHJcbiAgZm9udC13ZWlnaHQ6IDcwMDtcclxuICBib3JkZXItcmFkaXVzOiA4cHg7XHJcbiAgbWluLWhlaWdodDogNDBweDtcclxuICBjdXJzb3I6IHBvaW50ZXI7XHJcbn1cclxuXHJcbi50b29sYmFyLWJ0bjpkaXNhYmxlZCB7XHJcbiAgb3BhY2l0eTogMC40O1xyXG4gIGN1cnNvcjogbm90LWFsbG93ZWQ7XHJcbn1cclxuXHJcbi5yZXNldC1idG46aG92ZXIge1xyXG4gIGJvcmRlci1jb2xvcjogI2UwMDtcclxufVxyXG5cclxuLnR1cm4tYnRuIHtcclxuICBtaW4td2lkdGg6IDEwMHB4O1xyXG59XHJcblxyXG4udHVybi1idG4uYWN0aXZlIHtcclxuICBiYWNrZ3JvdW5kOiAjNGNhZjUwO1xyXG4gIGNvbG9yOiAjZmZmO1xyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
    });
  }
}

/***/ }),

/***/ 1512:
/*!**************************************!*\
  !*** ./src/app/models/card.model.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ALL_CARDS: () => (/* binding */ ALL_CARDS),
/* harmony export */   CARD_BY_ID: () => (/* binding */ CARD_BY_ID),
/* harmony export */   CardState: () => (/* binding */ CardState),
/* harmony export */   GamePhase: () => (/* binding */ GamePhase),
/* harmony export */   RANKS: () => (/* binding */ RANKS),
/* harmony export */   SUITS: () => (/* binding */ SUITS),
/* harmony export */   Suit: () => (/* binding */ Suit),
/* harmony export */   createCardId: () => (/* binding */ createCardId)
/* harmony export */ });
var Suit;
(function (Suit) {
  Suit["Denari"] = "Denari";
  Suit["Coppe"] = "Coppe";
  Suit["Spade"] = "Spade";
  Suit["Bastoni"] = "Bastoni";
})(Suit || (Suit = {}));
var CardState;
(function (CardState) {
  CardState["UNKNOWN"] = "UNKNOWN";
  CardState["IN_MY_HAND"] = "IN_MY_HAND";
  CardState["ON_TABLE"] = "ON_TABLE";
  CardState["ON_TABLE_BLINKING"] = "ON_TABLE_BLINKING";
  CardState["PLAYED"] = "PLAYED";
  CardState["COMBINATION_CANDIDATE"] = "COMBINATION_CANDIDATE";
})(CardState || (CardState = {}));
var GamePhase;
(function (GamePhase) {
  GamePhase["INITIAL_FOUR"] = "INITIAL_FOUR";
  GamePhase["PLAYING"] = "PLAYING";
  GamePhase["CHOOSE_COMBINATION"] = "CHOOSE_COMBINATION";
})(GamePhase || (GamePhase = {}));
const SUITS = [Suit.Denari, Suit.Coppe, Suit.Spade, Suit.Bastoni];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
function createCardId(suit, rank) {
  return `${suit.toLowerCase()}-${rank}`;
}
const ALL_CARDS = SUITS.flatMap(suit => RANKS.map(rank => ({
  id: createCardId(suit, rank),
  suit,
  rank
})));
const CARD_BY_ID = ALL_CARDS.reduce((acc, card) => {
  acc[card.id] = card;
  return acc;
}, {});

/***/ }),

/***/ 9179:
/*!***************************************************!*\
  !*** ./src/app/services/ai-suggestion.service.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AISuggestionService: () => (/* binding */ AISuggestionService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 819);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs */ 9999);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs */ 3900);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! rxjs */ 8764);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! rxjs */ 271);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! rxjs */ 1817);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! rxjs */ 1567);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! rxjs */ 2575);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! rxjs */ 6647);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! rxjs */ 9452);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! rxjs */ 1318);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! rxjs */ 9475);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../environments/environment */ 5312);
/* harmony import */ var _models_card_model__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../models/card.model */ 1512);
/* harmony import */ var _utils_combinations_util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/combinations.util */ 2010);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _game_state_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./game-state.service */ 5236);
/* harmony import */ var _probability_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./probability.service */ 9677);
/* harmony import */ var _openai_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./openai.service */ 4580);








class AISuggestionService {
  constructor(gameStateService, probabilityService, openAiService) {
    this.gameStateService = gameStateService;
    this.probabilityService = probabilityService;
    this.openAiService = openAiService;
    this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_6__.Subject();
    this.latestState = null;
    this.latestProbabilities = new Map();
    (0,rxjs__WEBPACK_IMPORTED_MODULE_7__.combineLatest)([this.gameStateService.state, this.probabilityService.probabilities$]).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_8__.takeUntil)(this.destroy$), (0,rxjs__WEBPACK_IMPORTED_MODULE_9__.tap)(([state, probabilities]) => {
      this.latestState = state;
      this.latestProbabilities = probabilities;
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_10__.map)(([state, probabilities]) => ({
      state,
      probabilities,
      key: this.buildTriggerKey(state, probabilities)
    })), (0,rxjs__WEBPACK_IMPORTED_MODULE_11__.distinctUntilChanged)((a, b) => a.key === b.key), (0,rxjs__WEBPACK_IMPORTED_MODULE_12__.filter)(({
      state
    }) => state.turn === 'ME' && state.myHand.length > 0 && state.phase === _models_card_model__WEBPACK_IMPORTED_MODULE_1__.GamePhase.PLAYING), (0,rxjs__WEBPACK_IMPORTED_MODULE_13__.debounceTime)(1000), (0,rxjs__WEBPACK_IMPORTED_MODULE_14__.switchMap)(({
      state,
      probabilities
    }) => this.executeQuery(state, probabilities))).subscribe();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  manualQuery() {
    const state = this.latestState;
    if (!state) {
      return;
    }
    this.executeQuery(state, this.latestProbabilities).subscribe();
  }
  isApiConfigured() {
    const endpoint = _environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.openaiProxyUrl.trim();
    return endpoint.length > 0 && endpoint !== 'YOUR_BACKEND_ENDPOINT_HERE';
  }
  executeQuery(state, probabilities) {
    if (!this.isApiConfigured()) {
      this.gameStateService.setAiLoading(false);
      this.gameStateService.setAiSuggestion('Configura endpoint backend OpenAI in environment.ts');
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_15__.of)(void 0);
    }
    if (!(state.turn === 'ME' && state.myHand.length > 0 && state.phase === _models_card_model__WEBPACK_IMPORTED_MODULE_1__.GamePhase.PLAYING)) {
      this.gameStateService.setAiLoading(false);
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_15__.of)(void 0);
    }
    const input = this.buildQueryInput(state, probabilities);
    this.gameStateService.setAiLoading(true);
    return this.openAiService.queryBestMove(input).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_9__.tap)(suggestion => {
      this.gameStateService.setAiSuggestion(suggestion);
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_16__.catchError)(() => {
      this.gameStateService.setAiSuggestion('Errore durante la richiesta a OpenAI.');
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_15__.of)('');
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_17__.finalize)(() => {
      this.gameStateService.setAiLoading(false);
    }), (0,rxjs__WEBPACK_IMPORTED_MODULE_10__.map)(() => void 0));
  }
  buildQueryInput(state, probabilities) {
    const probabilitiesByRank = {};
    for (let rank = 1; rank <= 10; rank += 1) {
      probabilitiesByRank[rank] = probabilities.get(rank) ?? 0;
    }
    const playedStates = new Set([_models_card_model__WEBPACK_IMPORTED_MODULE_1__.CardState.PLAYED, _models_card_model__WEBPACK_IMPORTED_MODULE_1__.CardState.ON_TABLE, _models_card_model__WEBPACK_IMPORTED_MODULE_1__.CardState.ON_TABLE_BLINKING, _models_card_model__WEBPACK_IMPORTED_MODULE_1__.CardState.COMBINATION_CANDIDATE]);
    const playedCards = Object.entries(state.cardStates).filter(([, cardState]) => playedStates.has(cardState)).map(([cardId]) => this.cardLabel(cardId));
    const unknownCardsCount = Object.values(state.cardStates).filter(cardState => cardState === _models_card_model__WEBPACK_IMPORTED_MODULE_1__.CardState.UNKNOWN).length;
    const tableCards = state.cardsOnTable.map(cardId => _models_card_model__WEBPACK_IMPORTED_MODULE_1__.CARD_BY_ID[cardId]).filter(card => !!card);
    return {
      myHand: state.myHand.map(cardId => this.cardLabel(cardId)),
      cardsOnTable: state.cardsOnTable.map(cardId => this.cardLabel(cardId)),
      playedCards,
      unknownCardsCount,
      probabilitiesByRank,
      opponentCardCount: state.opponentCardCount,
      legalMoves: state.myHand.map(cardId => this.buildLegalMove(cardId, tableCards)).filter(move => !!move)
    };
  }
  buildTriggerKey(state, probabilities) {
    const probabilityVector = Array.from({
      length: 10
    }, (_, index) => probabilities.get(index + 1) ?? 0);
    return JSON.stringify({
      cardStates: state.cardStates,
      phase: state.phase,
      turn: state.turn,
      myHand: state.myHand,
      cardsOnTable: state.cardsOnTable,
      opponentCardCount: state.opponentCardCount,
      pendingPlayedCard: state.pendingPlayedCard,
      selectedCombination: state.selectedCombination,
      probabilityVector
    });
  }
  cardLabel(cardId) {
    const card = _models_card_model__WEBPACK_IMPORTED_MODULE_1__.CARD_BY_ID[cardId];
    if (!card) {
      return cardId;
    }
    return `${this.rankLabel(card.rank)} di ${card.suit}`;
  }
  rankLabel(rank) {
    if (rank === 1) {
      return 'Asso';
    }
    if (rank === 8) {
      return 'Donna';
    }
    if (rank === 9) {
      return 'Cavallo';
    }
    if (rank === 10) {
      return 'Re';
    }
    return rank.toString();
  }
  buildLegalMove(cardId, tableCards) {
    const playedCard = _models_card_model__WEBPACK_IMPORTED_MODULE_1__.CARD_BY_ID[cardId];
    if (!playedCard) {
      return null;
    }
    const captures = (0,_utils_combinations_util__WEBPACK_IMPORTED_MODULE_2__.findCombinations)(playedCard.rank, tableCards).map(combination => combination.map(card => this.cardLabel(card.id)));
    return {
      card: this.cardLabel(playedCard.id),
      captures
    };
  }
  static {
    this.ɵfac = function AISuggestionService_Factory(t) {
      return new (t || AISuggestionService)(_angular_core__WEBPACK_IMPORTED_MODULE_18__["ɵɵinject"](_game_state_service__WEBPACK_IMPORTED_MODULE_3__.GameStateService), _angular_core__WEBPACK_IMPORTED_MODULE_18__["ɵɵinject"](_probability_service__WEBPACK_IMPORTED_MODULE_4__.ProbabilityService), _angular_core__WEBPACK_IMPORTED_MODULE_18__["ɵɵinject"](_openai_service__WEBPACK_IMPORTED_MODULE_5__.OpenAIService));
    };
  }
  static {
    this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_18__["ɵɵdefineInjectable"]({
      token: AISuggestionService,
      factory: AISuggestionService.ɵfac,
      providedIn: 'root'
    });
  }
}

/***/ }),

/***/ 4961:
/*!**************************************************!*\
  !*** ./src/app/services/card-tracker.service.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CardTrackerService: () => (/* binding */ CardTrackerService)
/* harmony export */ });
/* harmony import */ var _models_card_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/card.model */ 1512);
/* harmony import */ var _utils_combinations_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/combinations.util */ 2010);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 7580);



class CardTrackerService {
  handleTableCardClick(snapshot, cardId) {
    const card = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[cardId];
    if (!card) {
      return this.errorResult('Carta non valida');
    }
    if (snapshot.phase === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.INITIAL_FOUR) {
      const didMutate = this.handleInitialFour(snapshot, cardId);
      return this.okResult(didMutate);
    }
    if (snapshot.phase !== _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.PLAYING) {
      return this.errorResult('Seleziona una combinazione valida');
    }
    if (snapshot.turn === null) {
      return this.errorResult('Seleziona chi gioca per primo');
    }
    const cardState = snapshot.cardStates[cardId];
    if (snapshot.turn === 'ME') {
      if (cardState !== _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.IN_MY_HAND) {
        return this.errorResult('Questa carta non e nella tua mano');
      }
    } else if (cardState !== _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN) {
      return this.errorResult('Carta non selezionabile per l\'avversario');
    }
    return this.handlePlay(snapshot, card);
  }
  handleCombinationSelection(snapshot, cardId) {
    if (snapshot.phase !== _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.CHOOSE_COMBINATION || !snapshot.pendingPlayedCard) {
      return this.errorResult('Nessuna combinazione da selezionare');
    }
    const state = snapshot.cardStates[cardId];
    if (state !== _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE && state !== _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.COMBINATION_CANDIDATE) {
      return this.errorResult('Carta non selezionabile per la combinazione');
    }
    if (state === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE) {
      snapshot.cardStates[cardId] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.COMBINATION_CANDIDATE;
      if (!snapshot.selectedCombination.includes(cardId)) {
        snapshot.selectedCombination = [...snapshot.selectedCombination, cardId];
      }
    } else {
      snapshot.cardStates[cardId] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE;
      snapshot.selectedCombination = snapshot.selectedCombination.filter(id => id !== cardId);
    }
    const pending = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[snapshot.pendingPlayedCard];
    if (!pending) {
      return this.errorResult('Carta giocata in attesa non valida');
    }
    const selectedCards = snapshot.selectedCombination.map(id => _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[id]).filter(card => !!card);
    const selectedSum = selectedCards.reduce((acc, card) => acc + card.rank, 0);
    const tableCards = snapshot.cardsOnTable.map(id => _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[id]).filter(tableCard => !!tableCard);
    const validCombinations = (0,_utils_combinations_util__WEBPACK_IMPORTED_MODULE_1__.findCombinations)(pending.rank, tableCards);
    const isValidSelection = this.matchesAnyCombination(snapshot.selectedCombination, validCombinations);
    if (selectedSum !== pending.rank || !isValidSelection) {
      return this.okResult(true);
    }
    for (const selectedId of snapshot.selectedCombination) {
      snapshot.cardStates[selectedId] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.PLAYED;
    }
    snapshot.cardStates[snapshot.pendingPlayedCard] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.PLAYED;
    snapshot.cardsOnTable = snapshot.cardsOnTable.filter(id => !snapshot.selectedCombination.includes(id));
    this.recordCapture(snapshot, snapshot.turn === 'ME', snapshot.pendingPlayedCard, snapshot.selectedCombination);
    const actor = this.actorLabel(snapshot.turn);
    const selectedLabel = snapshot.selectedCombination.map(id => _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[id]).filter(card => !!card).map(card => this.cardLabel(card)).join(', ');
    snapshot.lastPlayLog = `${actor} gioca ${this.cardLabel(pending)}, prende ${selectedLabel}`;
    if (snapshot.myHand.includes(snapshot.pendingPlayedCard)) {
      snapshot.myHand = snapshot.myHand.filter(id => id !== snapshot.pendingPlayedCard);
    }
    snapshot.pendingPlayedCard = null;
    snapshot.selectedCombination = [];
    snapshot.phase = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.PLAYING;
    return {
      error: null,
      shouldToggleTurn: true,
      shouldDecrementOpponent: false,
      didMutate: true
    };
  }
  handleInitialFour(snapshot, cardId) {
    const current = snapshot.cardStates[cardId];
    if (current === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN) {
      snapshot.cardStates[cardId] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE;
      if (!snapshot.cardsOnTable.includes(cardId)) {
        snapshot.cardsOnTable = [...snapshot.cardsOnTable, cardId];
      }
      snapshot.initialFourCount += 1;
      snapshot.phase = snapshot.initialFourCount >= 4 ? _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.PLAYING : _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.INITIAL_FOUR;
      return true;
    }
    if (current === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE) {
      snapshot.cardStates[cardId] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN;
      snapshot.cardsOnTable = snapshot.cardsOnTable.filter(id => id !== cardId);
      snapshot.initialFourCount = Math.max(0, snapshot.initialFourCount - 1);
      snapshot.phase = snapshot.initialFourCount >= 4 ? _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.PLAYING : _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.INITIAL_FOUR;
      return true;
    }
    return false;
  }
  handlePlay(snapshot, playedCard) {
    const actor = this.actorLabel(snapshot.turn);
    const isMyPlay = snapshot.turn === 'ME';
    const tableCards = snapshot.cardsOnTable.map(id => _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[id]).filter(card => !!card);
    const combinations = (0,_utils_combinations_util__WEBPACK_IMPORTED_MODULE_1__.findCombinations)(playedCard.rank, tableCards);
    if (combinations.length === 0) {
      snapshot.cardStates[playedCard.id] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE;
      if (!snapshot.cardsOnTable.includes(playedCard.id)) {
        snapshot.cardsOnTable = [...snapshot.cardsOnTable, playedCard.id];
      }
      if (isMyPlay) {
        snapshot.myHand = snapshot.myHand.filter(id => id !== playedCard.id);
      }
      snapshot.lastPlayLog = `${actor} gioca ${this.cardLabel(playedCard)}, nessuna presa`;
      return {
        error: null,
        shouldToggleTurn: true,
        shouldDecrementOpponent: snapshot.turn === 'OPPONENT',
        didMutate: true
      };
    }
    if (combinations.length === 1) {
      const combo = combinations[0];
      const comboIds = combo.map(card => card.id);
      for (const comboId of comboIds) {
        snapshot.cardStates[comboId] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.PLAYED;
      }
      snapshot.cardStates[playedCard.id] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.PLAYED;
      snapshot.cardsOnTable = snapshot.cardsOnTable.filter(id => !comboIds.includes(id));
      this.recordCapture(snapshot, isMyPlay, playedCard.id, comboIds);
      if (isMyPlay) {
        snapshot.myHand = snapshot.myHand.filter(id => id !== playedCard.id);
      }
      const capturedLabel = combo.map(card => this.cardLabel(card)).join(', ');
      snapshot.lastPlayLog = `${actor} gioca ${this.cardLabel(playedCard)}, prende ${capturedLabel}`;
      return {
        error: null,
        shouldToggleTurn: true,
        shouldDecrementOpponent: snapshot.turn === 'OPPONENT',
        didMutate: true
      };
    }
    snapshot.phase = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.CHOOSE_COMBINATION;
    snapshot.cardStates[playedCard.id] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE_BLINKING;
    snapshot.pendingPlayedCard = playedCard.id;
    snapshot.selectedCombination = [];
    snapshot.lastPlayLog = `${actor} gioca ${this.cardLabel(playedCard)}, selezionare combinazione`;
    return {
      error: null,
      shouldToggleTurn: false,
      shouldDecrementOpponent: snapshot.turn === 'OPPONENT',
      didMutate: true
    };
  }
  matchesAnyCombination(selectedIds, combinations) {
    if (selectedIds.length === 0) {
      return false;
    }
    const selectedKey = [...selectedIds].sort().join('|');
    return combinations.some(combination => {
      const comboKey = combination.map(card => card.id).sort().join('|');
      return comboKey === selectedKey;
    });
  }
  actorLabel(turn) {
    return turn === 'ME' ? 'Tu' : 'Avversario';
  }
  recordCapture(snapshot, isMyPlay, playedCardId, capturedIds) {
    const target = isMyPlay ? snapshot.myCapturedCards : snapshot.opponentCapturedCards;
    const merged = [...target, playedCardId, ...capturedIds];
    const unique = [...new Set(merged)];
    if (isMyPlay) {
      snapshot.myCapturedCards = unique;
      return;
    }
    snapshot.opponentCapturedCards = unique;
  }
  cardLabel(card) {
    return `${this.rankLabel(card.rank)} di ${card.suit}`;
  }
  rankLabel(rank) {
    if (rank === 1) {
      return 'Asso';
    }
    if (rank === 8) {
      return 'Donna';
    }
    if (rank === 9) {
      return 'Cavallo';
    }
    if (rank === 10) {
      return 'Re';
    }
    return rank.toString();
  }
  errorResult(message) {
    return {
      error: message,
      shouldToggleTurn: false,
      shouldDecrementOpponent: false,
      didMutate: false
    };
  }
  okResult(didMutate) {
    return {
      error: null,
      shouldToggleTurn: false,
      shouldDecrementOpponent: false,
      didMutate
    };
  }
  static {
    this.ɵfac = function CardTrackerService_Factory(t) {
      return new (t || CardTrackerService)();
    };
  }
  static {
    this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
      token: CardTrackerService,
      factory: CardTrackerService.ɵfac,
      providedIn: 'root'
    });
  }
}

/***/ }),

/***/ 5236:
/*!************************************************!*\
  !*** ./src/app/services/game-state.service.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GameStateService: () => (/* binding */ GameStateService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 5797);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 271);
/* harmony import */ var _models_card_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/card.model */ 1512);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _card_tracker_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./card-tracker.service */ 4961);
/* harmony import */ var _local_storage_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./local-storage.service */ 3077);





class GameStateService {
  constructor(cardTracker, localStorageService) {
    this.cardTracker = cardTracker;
    this.localStorageService = localStorageService;
    this.storageKey = 'state';
    this.stateSubject = new rxjs__WEBPACK_IMPORTED_MODULE_3__.BehaviorSubject(this.createInitialState());
    this.state = this.stateSubject.asObservable();
    this.cardStates = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.cardStates));
    this.phase = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.phase));
    this.turn = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.turn));
    this.myHand = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.myHand));
    this.opponentCardCount = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.opponentCardCount));
    this.cardsOnTable = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.cardsOnTable));
    this.myCapturedCards = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.myCapturedCards));
    this.opponentCapturedCards = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.opponentCapturedCards));
    this.lastPlayLog = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.lastPlayLog));
    this.aiSuggestion = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.aiSuggestion));
    this.aiLoading = this.state.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_4__.map)(state => state.aiLoading));
    this.stateSubject.next(this.restoreState());
  }
  getCurrentState() {
    return this.stateSubject.value;
  }
  reset() {
    const next = this.createInitialState();
    this.commit(next);
  }
  undo() {
    const current = this.stateSubject.value;
    if (current.history.length === 0) {
      return;
    }
    const previous = current.history[current.history.length - 1];
    const restored = this.cloneSnapshot(previous);
    const next = {
      ...restored,
      history: current.history.slice(0, -1).map(snapshot => this.cloneSnapshot(snapshot)),
      aiSuggestion: current.aiSuggestion,
      aiLoading: current.aiLoading
    };
    this.commit(next);
  }
  setTurn(turn) {
    this.applyMutation(draft => {
      if (draft.turn !== null) {
        return false;
      }
      this.setTurnWithOpponentRefill(draft, turn);
      return true;
    });
  }
  toggleTurn() {
    this.applyMutation(draft => {
      if (draft.turn === null) {
        return false;
      }
      const nextTurn = draft.turn === 'ME' ? 'OPPONENT' : 'ME';
      this.setTurnWithOpponentRefill(draft, nextTurn);
      return true;
    });
  }
  clickTableCard(cardId) {
    let error = null;
    this.applyMutation(draft => {
      const result = this.cardTracker.handleTableCardClick(draft, cardId);
      if (result.error) {
        error = result.error;
        return false;
      }
      if (!result.didMutate) {
        return false;
      }
      if (result.shouldDecrementOpponent) {
        draft.opponentCardCount = Math.max(0, draft.opponentCardCount - 1);
      }
      if (result.shouldToggleTurn) {
        const nextTurn = draft.turn === 'ME' ? 'OPPONENT' : 'ME';
        this.setTurnWithOpponentRefill(draft, nextTurn);
      }
      return true;
    });
    return error;
  }
  clickHandCard(cardId) {
    this.applyMutation(draft => {
      const current = draft.cardStates[cardId];
      if (!current) {
        return false;
      }
      if (current === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.PLAYED || current === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE || current === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE_BLINKING || current === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.COMBINATION_CANDIDATE) {
        return false;
      }
      if (current === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.IN_MY_HAND) {
        draft.cardStates[cardId] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN;
        draft.myHand = draft.myHand.filter(id => id !== cardId);
        return true;
      }
      if (current === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN && draft.myHand.length < 3) {
        draft.cardStates[cardId] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.IN_MY_HAND;
        draft.myHand = [...draft.myHand, cardId];
        return true;
      }
      return false;
    });
  }
  selectCombinationCard(cardId) {
    let error = null;
    this.applyMutation(draft => {
      const result = this.cardTracker.handleCombinationSelection(draft, cardId);
      if (result.error) {
        error = result.error;
        return false;
      }
      if (!result.didMutate) {
        return false;
      }
      if (result.shouldToggleTurn) {
        const nextTurn = draft.turn === 'ME' ? 'OPPONENT' : 'ME';
        this.setTurnWithOpponentRefill(draft, nextTurn);
      }
      return true;
    });
    return error;
  }
  setOpponentCardCount(value) {
    const nextValue = this.clamp(Math.round(value), 0, 3);
    this.applyMutation(draft => {
      if (draft.opponentCardCount === nextValue) {
        return false;
      }
      draft.opponentCardCount = nextValue;
      return true;
    });
  }
  decrementOpponentCards() {
    this.applyMutation(draft => {
      const next = Math.max(0, draft.opponentCardCount - 1);
      if (next === draft.opponentCardCount) {
        return false;
      }
      draft.opponentCardCount = next;
      return true;
    });
  }
  setAiSuggestion(suggestion) {
    this.applyMutation(draft => {
      if (draft.aiSuggestion === suggestion) {
        return false;
      }
      draft.aiSuggestion = suggestion;
      return true;
    });
  }
  setAiLoading(loading) {
    this.applyMutation(draft => {
      if (draft.aiLoading === loading) {
        return false;
      }
      draft.aiLoading = loading;
      return true;
    });
  }
  applyMutation(mutator) {
    const current = this.stateSubject.value;
    const draft = this.cloneState(current);
    const didMutate = mutator(draft);
    if (!didMutate) {
      return;
    }
    draft.history.push(this.cloneSnapshot(this.toSnapshot(current)));
    this.commit(draft);
  }
  commit(state) {
    this.stateSubject.next(state);
    this.localStorageService.save(this.storageKey, state);
  }
  restoreState() {
    const loaded = this.localStorageService.load(this.storageKey);
    if (!loaded) {
      return this.createInitialState();
    }
    return this.normalizeState(loaded);
  }
  normalizeState(raw) {
    const snapshot = this.normalizeSnapshot(raw);
    const historyRaw = Array.isArray(raw.history) ? raw.history : [];
    const history = historyRaw.map(item => this.normalizeSnapshot(item));
    return {
      ...snapshot,
      history,
      aiSuggestion: typeof raw.aiSuggestion === 'string' ? raw.aiSuggestion : '',
      aiLoading: typeof raw.aiLoading === 'boolean' ? raw.aiLoading : false
    };
  }
  normalizeSnapshot(raw) {
    const initial = this.createInitialSnapshot();
    const cardStates = {};
    const validStates = new Set(Object.values(_models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState));
    for (const card of _models_card_model__WEBPACK_IMPORTED_MODULE_0__.ALL_CARDS) {
      const value = raw.cardStates?.[card.id];
      cardStates[card.id] = validStates.has(value) ? value : _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN;
    }
    const phaseValues = new Set(Object.values(_models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase));
    const phase = phaseValues.has(raw.phase) ? raw.phase : _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.INITIAL_FOUR;
    const turn = raw.turn === 'ME' || raw.turn === 'OPPONENT' ? raw.turn : null;
    const myHand = this.uniqueIds(Array.isArray(raw.myHand) ? raw.myHand : []).filter(id => id in _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID).slice(0, 3);
    const cardsOnTable = this.uniqueIds(Array.isArray(raw.cardsOnTable) ? raw.cardsOnTable : []).filter(id => id in _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID);
    const myCapturedCards = this.uniqueIds(Array.isArray(raw.myCapturedCards) ? raw.myCapturedCards : []).filter(id => id in _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID);
    const opponentCapturedCards = this.uniqueIds(Array.isArray(raw.opponentCapturedCards) ? raw.opponentCapturedCards : []).filter(id => id in _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID);
    const selectedCombination = this.uniqueIds(Array.isArray(raw.selectedCombination) ? raw.selectedCombination : []).filter(id => id in _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID);
    for (const id of myHand) {
      if (cardStates[id] === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN) {
        cardStates[id] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.IN_MY_HAND;
      }
    }
    for (const id of cardsOnTable) {
      if (cardStates[id] === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN) {
        cardStates[id] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE;
      }
    }
    const pendingPlayedCard = typeof raw.pendingPlayedCard === 'string' && raw.pendingPlayedCard in _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID ? raw.pendingPlayedCard : null;
    if (pendingPlayedCard && cardStates[pendingPlayedCard] === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN) {
      cardStates[pendingPlayedCard] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE_BLINKING;
    }
    for (const id of selectedCombination) {
      if (cardStates[id] === _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.ON_TABLE) {
        cardStates[id] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.COMBINATION_CANDIDATE;
      }
    }
    return {
      ...initial,
      cardStates,
      phase,
      turn,
      myHand,
      opponentCardCount: this.clamp(typeof raw.opponentCardCount === 'number' ? Math.round(raw.opponentCardCount) : 3, 0, 3),
      cardsOnTable,
      myCapturedCards,
      opponentCapturedCards,
      initialFourCount: this.clamp(typeof raw.initialFourCount === 'number' ? Math.round(raw.initialFourCount) : cardsOnTable.length, 0, 4),
      lastPlayLog: typeof raw.lastPlayLog === 'string' ? raw.lastPlayLog : '',
      pendingPlayedCard,
      selectedCombination
    };
  }
  createInitialState() {
    return {
      ...this.createInitialSnapshot(),
      history: [],
      aiSuggestion: '',
      aiLoading: false
    };
  }
  createInitialSnapshot() {
    const cardStates = {};
    for (const card of _models_card_model__WEBPACK_IMPORTED_MODULE_0__.ALL_CARDS) {
      cardStates[card.id] = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN;
    }
    return {
      cardStates,
      phase: _models_card_model__WEBPACK_IMPORTED_MODULE_0__.GamePhase.INITIAL_FOUR,
      turn: null,
      myHand: [],
      opponentCardCount: 3,
      cardsOnTable: [],
      myCapturedCards: [],
      opponentCapturedCards: [],
      initialFourCount: 0,
      lastPlayLog: '',
      pendingPlayedCard: null,
      selectedCombination: []
    };
  }
  toSnapshot(state) {
    return {
      cardStates: {
        ...state.cardStates
      },
      phase: state.phase,
      turn: state.turn,
      myHand: [...state.myHand],
      opponentCardCount: state.opponentCardCount,
      cardsOnTable: [...state.cardsOnTable],
      myCapturedCards: [...state.myCapturedCards],
      opponentCapturedCards: [...state.opponentCapturedCards],
      initialFourCount: state.initialFourCount,
      lastPlayLog: state.lastPlayLog,
      pendingPlayedCard: state.pendingPlayedCard,
      selectedCombination: [...state.selectedCombination]
    };
  }
  cloneSnapshot(snapshot) {
    return {
      cardStates: {
        ...snapshot.cardStates
      },
      phase: snapshot.phase,
      turn: snapshot.turn,
      myHand: [...snapshot.myHand],
      opponentCardCount: snapshot.opponentCardCount,
      cardsOnTable: [...snapshot.cardsOnTable],
      myCapturedCards: [...snapshot.myCapturedCards],
      opponentCapturedCards: [...snapshot.opponentCapturedCards],
      initialFourCount: snapshot.initialFourCount,
      lastPlayLog: snapshot.lastPlayLog,
      pendingPlayedCard: snapshot.pendingPlayedCard,
      selectedCombination: [...snapshot.selectedCombination]
    };
  }
  cloneState(state) {
    return {
      ...this.cloneSnapshot(state),
      history: state.history.map(snapshot => this.cloneSnapshot(snapshot)),
      aiSuggestion: state.aiSuggestion,
      aiLoading: state.aiLoading
    };
  }
  uniqueIds(ids) {
    return [...new Set(ids)];
  }
  setTurnWithOpponentRefill(draft, turn) {
    const previousTurn = draft.turn;
    draft.turn = turn;
    const isHandRefillTurnChange = previousTurn === 'ME' && turn === 'OPPONENT';
    if (isHandRefillTurnChange && draft.opponentCardCount === 0) {
      draft.opponentCardCount = 3;
    }
  }
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  static {
    this.ɵfac = function GameStateService_Factory(t) {
      return new (t || GameStateService)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵinject"](_card_tracker_service__WEBPACK_IMPORTED_MODULE_1__.CardTrackerService), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵinject"](_local_storage_service__WEBPACK_IMPORTED_MODULE_2__.LocalStorageService));
    };
  }
  static {
    this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjectable"]({
      token: GameStateService,
      factory: GameStateService.ɵfac,
      providedIn: 'root'
    });
  }
}

/***/ }),

/***/ 3077:
/*!***************************************************!*\
  !*** ./src/app/services/local-storage.service.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LocalStorageService: () => (/* binding */ LocalStorageService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 7580);

class LocalStorageService {
  constructor() {
    this.prefix = 'scopa_ng_';
  }
  save(key, data) {
    try {
      localStorage.setItem(this.buildKey(key), JSON.stringify(data));
    } catch {
      // Storage may be unavailable, fail silently.
    }
  }
  load(key) {
    try {
      const raw = localStorage.getItem(this.buildKey(key));
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  remove(key) {
    try {
      localStorage.removeItem(this.buildKey(key));
    } catch {
      // Storage may be unavailable, fail silently.
    }
  }
  buildKey(key) {
    return `${this.prefix}${key}`;
  }
  static {
    this.ɵfac = function LocalStorageService_Factory(t) {
      return new (t || LocalStorageService)();
    };
  }
  static {
    this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({
      token: LocalStorageService,
      factory: LocalStorageService.ɵfac,
      providedIn: 'root'
    });
  }
}

/***/ }),

/***/ 4580:
/*!********************************************!*\
  !*** ./src/app/services/openai.service.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OpenAIService: () => (/* binding */ OpenAIService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ 271);
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../environments/environment */ 5312);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common/http */ 6443);




class OpenAIService {
  constructor(http) {
    this.http = http;
    this.endpoint = _environments_environment__WEBPACK_IMPORTED_MODULE_0__.environment.openaiProxyUrl;
  }
  queryBestMove(input) {
    return this.http.post(this.endpoint, input).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_1__.map)(response => response.suggestion?.trim() || 'Nessun suggerimento disponibile.'));
  }
  static {
    this.ɵfac = function OpenAIService_Factory(t) {
      return new (t || OpenAIService)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_3__.HttpClient));
    };
  }
  static {
    this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
      token: OpenAIService,
      factory: OpenAIService.ɵfac,
      providedIn: 'root'
    });
  }
}

/***/ }),

/***/ 9677:
/*!*************************************************!*\
  !*** ./src/app/services/probability.service.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProbabilityService: () => (/* binding */ ProbabilityService)
/* harmony export */ });
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs */ 9999);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 271);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ 6301);
/* harmony import */ var _models_card_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/card.model */ 1512);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _game_state_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./game-state.service */ 5236);




class ProbabilityService {
  constructor(gameStateService) {
    this.gameStateService = gameStateService;
    this.probabilities$ = (0,rxjs__WEBPACK_IMPORTED_MODULE_2__.combineLatest)([this.gameStateService.cardStates, this.gameStateService.opponentCardCount]).pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_3__.map)(([cardStates, opponentCardCount]) => this.computeProbabilities(cardStates, opponentCardCount)), (0,rxjs__WEBPACK_IMPORTED_MODULE_4__.shareReplay)({
      bufferSize: 1,
      refCount: true
    }));
  }
  computeProbabilities(cardStates, opponentCardCount) {
    const unknownByRank = new Map();
    for (const rank of _models_card_model__WEBPACK_IMPORTED_MODULE_0__.RANKS) {
      unknownByRank.set(rank, 0);
    }
    let totalUnknown = 0;
    for (const [cardId, state] of Object.entries(cardStates)) {
      if (state !== _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CardState.UNKNOWN) {
        continue;
      }
      const card = _models_card_model__WEBPACK_IMPORTED_MODULE_0__.CARD_BY_ID[cardId];
      if (!card) {
        continue;
      }
      totalUnknown += 1;
      unknownByRank.set(card.rank, (unknownByRank.get(card.rank) ?? 0) + 1);
    }
    const result = new Map();
    if (opponentCardCount <= 0 || totalUnknown <= 0) {
      for (const rank of _models_card_model__WEBPACK_IMPORTED_MODULE_0__.RANKS) {
        result.set(rank, 0);
      }
      return result;
    }
    const drawSize = Math.min(opponentCardCount, totalUnknown);
    for (const rank of _models_card_model__WEBPACK_IMPORTED_MODULE_0__.RANKS) {
      const unknownOfRank = unknownByRank.get(rank) ?? 0;
      if (unknownOfRank <= 0) {
        result.set(rank, 0);
        continue;
      }
      const denominator = this.combinations(totalUnknown, drawSize);
      const numerator = this.combinations(totalUnknown - unknownOfRank, drawSize);
      if (denominator <= 0) {
        result.set(rank, 0);
        continue;
      }
      result.set(rank, 1 - numerator / denominator);
    }
    return result;
  }
  combinations(n, k) {
    if (k < 0 || k > n) {
      return 0;
    }
    if (k === 0 || k === n) {
      return 1;
    }
    const kk = Math.min(k, n - k);
    let result = 1;
    for (let i = 1; i <= kk; i += 1) {
      result = result * (n - kk + i) / i;
    }
    return result;
  }
  static {
    this.ɵfac = function ProbabilityService_Factory(t) {
      return new (t || ProbabilityService)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵinject"](_game_state_service__WEBPACK_IMPORTED_MODULE_1__.GameStateService));
    };
  }
  static {
    this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineInjectable"]({
      token: ProbabilityService,
      factory: ProbabilityService.ɵfac,
      providedIn: 'root'
    });
  }
}

/***/ }),

/***/ 2010:
/*!********************************************!*\
  !*** ./src/app/utils/combinations.util.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   findCombinations: () => (/* binding */ findCombinations)
/* harmony export */ });
function findCombinations(targetSum, tableCards) {
  if (targetSum <= 0 || tableCards.length === 0) {
    return [];
  }
  // Scopa rule: if cards with exact same rank exist on table, capture must be among those.
  const exactMatches = tableCards.filter(card => card.rank === targetSum);
  if (exactMatches.length > 0) {
    return exactMatches.map(card => [card]);
  }
  const combinations = [];
  const n = tableCards.length;
  const maxMask = 1 << n;
  for (let mask = 1; mask < maxMask; mask += 1) {
    let sum = 0;
    const subset = [];
    for (let i = 0; i < n; i += 1) {
      if ((mask & 1 << i) === 0) {
        continue;
      }
      const card = tableCards[i];
      subset.push(card);
      sum += card.rank;
    }
    if (sum === targetSum) {
      combinations.push(subset);
    }
  }
  return combinations;
}

/***/ }),

/***/ 5312:
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   environment: () => (/* binding */ environment)
/* harmony export */ });
const environment = {
  production: false,
  openaiProxyUrl: '/api/openai/suggestion'
};

/***/ }),

/***/ 4429:
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/platform-browser */ 436);
/* harmony import */ var _app_app_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./app/app.config */ 289);
/* harmony import */ var _app_app_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app/app.component */ 92);



(0,_angular_platform_browser__WEBPACK_IMPORTED_MODULE_2__.bootstrapApplication)(_app_app_component__WEBPACK_IMPORTED_MODULE_1__.AppComponent, _app_app_config__WEBPACK_IMPORTED_MODULE_0__.appConfig).catch(err => console.error(err));

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["vendor"], () => (__webpack_exec__(4429)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=main.js.map