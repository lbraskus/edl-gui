const STORAGE_KEYS = {
  entries: "co2-calculator-entries",
  factors: "co2-calculator-factors",
  buildings: "co2-calculator-buildings",
};

const DEFAULT_BUILDINGS = [
  {
    id: "main-office",
    name: "Main office",
    grossFloorAreaM2: 6300,
    netLeasedAreaM2: 4100,
    ownershipType: "mixed",
    energyControl: "shared",
    heatingType: "district_heat",
  },
];

const DEFAULT_FACTORS = [
  {
    key: "building-natural-gas-lt-2026",
    module: "Building",
    category: "Energy",
    subcategory: "Natural gas",
    ghgScope: "Scope 1",
    method: "activity",
    activity: "Natural gas",
    inputUnit: "kWh",
    defaultValue: 0.202,
    unitLabel: "kg CO2e / kWh",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "building-electricity-lt-2026",
    module: "Building",
    category: "Energy",
    subcategory: "Electricity",
    ghgScope: "Scope 2",
    method: "activity",
    activity: "Electricity",
    inputUnit: "kWh",
    defaultValue: 0.233,
    unitLabel: "kg CO2e / kWh",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "building-purchased-heat-lt-2026",
    module: "Building",
    category: "Energy",
    subcategory: "Purchased heat",
    ghgScope: "Scope 2",
    method: "activity",
    activity: "Purchased heat",
    inputUnit: "kWh",
    defaultValue: 0.18,
    unitLabel: "kg CO2e / kWh",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "personnel-commute-car-lt-2026",
    module: "Personnel",
    category: "Commuting",
    subcategory: "Car",
    ghgScope: "Scope 3",
    method: "activity",
    activity: "Employee commute by car",
    inputUnit: "km",
    defaultValue: 0.12,
    unitLabel: "kg CO2e / km",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "personnel-commute-bus-lt-2026",
    module: "Personnel",
    category: "Commuting",
    subcategory: "Bus",
    ghgScope: "Scope 3",
    method: "activity",
    activity: "Employee commute by bus",
    inputUnit: "km",
    defaultValue: 0.055,
    unitLabel: "kg CO2e / km",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "personnel-home-office-lt-2026",
    module: "Personnel",
    category: "Remote work",
    subcategory: "Home office",
    ghgScope: "Scope 3",
    method: "activity",
    activity: "Home office",
    inputUnit: "day",
    defaultValue: 1.8,
    unitLabel: "kg CO2e / day",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "waste-mixed-lt-2026",
    module: "Waste",
    category: "Waste treatment",
    subcategory: "Mixed waste",
    ghgScope: "Scope 3",
    method: "activity",
    activity: "Mixed waste",
    inputUnit: "kg",
    defaultValue: 0.59,
    unitLabel: "kg CO2e / kg",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "waste-recycling-lt-2026",
    module: "Waste",
    category: "Waste treatment",
    subcategory: "Recycling",
    ghgScope: "Scope 3",
    method: "activity",
    activity: "Recycling",
    inputUnit: "kg",
    defaultValue: 0.08,
    unitLabel: "kg CO2e / kg",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "travel-rail-lt-2026",
    module: "Travel",
    category: "Business travel",
    subcategory: "Rail travel",
    ghgScope: "Scope 3",
    method: "activity",
    activity: "Rail travel",
    inputUnit: "km",
    defaultValue: 0.04,
    unitLabel: "kg CO2e / km",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "travel-air-lt-2026",
    module: "Travel",
    category: "Business travel",
    subcategory: "Air travel",
    ghgScope: "Scope 3",
    method: "activity",
    activity: "Air travel",
    inputUnit: "km",
    defaultValue: 0.255,
    unitLabel: "kg CO2e / km",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "travel-car-lt-2026",
    module: "Travel",
    category: "Business travel",
    subcategory: "Car travel",
    ghgScope: "Scope 3",
    method: "activity",
    activity: "Car travel",
    inputUnit: "km",
    defaultValue: 0.17,
    unitLabel: "kg CO2e / km",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
  {
    key: "travel-hotel-lt-2026",
    module: "Travel",
    category: "Business travel",
    subcategory: "Hotel stay",
    ghgScope: "Scope 3",
    method: "activity",
    activity: "Hotel stay",
    inputUnit: "night",
    defaultValue: 15,
    unitLabel: "kg CO2e / night",
    source: "Default",
    region: "LT",
    validFrom: "2026-01-01",
  },
];

const SAMPLE_CSV = `date,vendor,description,module,ghg_scope,activity,amount,quantity,unit,building_id,owner_share_pct,tenant_share_pct,reported_by,transport_mode,traveler_count,nights,round_trip,employees_covered,survey_period,notes
2026-03-02,Gas Supplier,Boiler gas invoice,Building,Scope 1,Natural gas,0,1200,kWh,main-office,100,0,building_owner,,,,,,,On-site gas for owner-controlled heating
2026-03-03,City Power,Electricity invoice,Building,Scope 2,Electricity,0,890,kWh,main-office,50,50,shared_meter,,,,,,,Main office electricity split between owner and tenants
2026-03-04,District Heat,Purchased heat invoice,Building,Scope 2,Purchased heat,0,640,kWh,main-office,30,70,tenant,,,,,,,Tenant-billed heat in mixed building
2026-03-05,Transit Survey,Employee commute by car,Personnel,Scope 3,Employee commute by car,0,420,km,,,organization,car,,,,12,weekly,Weekly commuting survey estimate
2026-03-06,Transit Survey,Employee commute by bus,Personnel,Scope 3,Employee commute by bus,0,280,km,,,organization,bus,,,,8,weekly,Weekly commuting survey estimate
2026-03-07,ReWaste,Mixed waste pickup,Waste,Scope 3,Mixed waste,0,85,kg,,,,,,,,,,Office waste
2026-03-10,Lithuanian Rail,Client travel,Travel,Scope 3,Rail travel,0,310,km,,,organization,rail,1,,false,,,,Regional trip
2026-03-12,Air Baltic,Conference flight,Travel,Scope 3,Air travel,0,1850,km,,,organization,air,1,,true,,,,Return flight
2026-03-13,Hotel Vilnius,Conference stay,Travel,Scope 3,Hotel stay,0,2,night,,,organization,hotel,1,2,false,,,,Accommodation`;

const state = {
  entries: [],
  factors: [],
  buildings: [],
};

const elements = {
  moduleSelect: document.querySelector('select[name="module"]'),
  ghgScopeInput: document.querySelector('input[name="ghgScope"]'),
  activitySelect: document.querySelector('select[name="activity"]'),
  buildingSelect: document.querySelector('select[name="buildingId"]'),
  unitInput: document.querySelector('input[name="unit"]'),
  ownerShareInput: document.querySelector('input[name="ownerSharePct"]'),
  tenantShareInput: document.querySelector('input[name="tenantSharePct"]'),
  reportedBySelect: document.querySelector('select[name="reportedBy"]'),
  transportModeInput: document.querySelector('input[name="transportMode"]'),
  travelerCountInput: document.querySelector('input[name="travelerCount"]'),
  nightsInput: document.querySelector('input[name="nights"]'),
  roundTripSelect: document.querySelector('select[name="roundTrip"]'),
  employeesCoveredInput: document.querySelector('input[name="employeesCovered"]'),
  surveyPeriodInput: document.querySelector('input[name="surveyPeriod"]'),
  factorHint: document.getElementById("factor-hint"),
  validationHint: document.getElementById("validation-hint"),
  entryForm: document.getElementById("entry-form"),
  factorForm: document.getElementById("factor-form"),
  buildingForm: document.getElementById("building-form"),
  factorTable: document.getElementById("factor-table"),
  buildingTable: document.getElementById("building-table"),
  recordsBody: document.getElementById("records-body"),
  csvFile: document.getElementById("csv-file"),
  factorFile: document.getElementById("factor-file"),
  loadSample: document.getElementById("load-sample"),
  resetData: document.getElementById("reset-data"),
  downloadFactors: document.getElementById("download-factors"),
  totalEmissions: document.getElementById("total-emissions"),
  recordCount: document.getElementById("record-count"),
  summaryScope1: document.getElementById("summary-scope1"),
  summaryScope2: document.getElementById("summary-scope2"),
  summaryScope3: document.getElementById("summary-scope3"),
  summaryBuilding: document.getElementById("summary-building"),
  summaryPersonnel: document.getElementById("summary-personnel"),
  summaryWaste: document.getElementById("summary-waste"),
  summaryTravel: document.getElementById("summary-travel"),
  summaryIntensity: document.getElementById("summary-intensity"),
  summaryOwner: document.getElementById("summary-owner"),
  summaryTenant: document.getElementById("summary-tenant"),
  summaryCommuting: document.getElementById("summary-commuting"),
  summaryBusinessTravel: document.getElementById("summary-business-travel"),
  factorRowTemplate: document.getElementById("factor-row-template"),
};

function hydrateState() {
  const savedEntries = safeJsonParse(localStorage.getItem(STORAGE_KEYS.entries), []);
  const savedFactors = safeJsonParse(localStorage.getItem(STORAGE_KEYS.factors), []);
  const savedBuildings = safeJsonParse(localStorage.getItem(STORAGE_KEYS.buildings), []);

  state.buildings = mergeBuildings(DEFAULT_BUILDINGS, savedBuildings);
  state.factors = mergeFactors(DEFAULT_FACTORS, savedFactors);
  state.entries = Array.isArray(savedEntries) ? savedEntries.map(normalizeEntry).filter(Boolean) : [];
}

function mergeBuildings(defaults, saved) {
  const merged = defaults.map((building) => {
    const override = Array.isArray(saved) ? saved.find((item) => item.id === building.id) : null;
    return {
      ...building,
      ...override,
      grossFloorAreaM2: Number(override?.grossFloorAreaM2 ?? building.grossFloorAreaM2 ?? 0),
      netLeasedAreaM2: Number(override?.netLeasedAreaM2 ?? building.netLeasedAreaM2 ?? 0),
    };
  });

  (Array.isArray(saved) ? saved : [])
    .filter((item) => item?.id && !merged.some((building) => building.id === item.id))
    .forEach((item) => {
      merged.push({
        id: item.id,
        name: item.name || item.id,
        grossFloorAreaM2: Number(item.grossFloorAreaM2 || 0),
        netLeasedAreaM2: Number(item.netLeasedAreaM2 || 0),
        ownershipType: item.ownershipType || "owner-occupied",
        energyControl: item.energyControl || "owner",
        heatingType: item.heatingType || "other",
      });
    });

  return merged;
}

function mergeFactors(defaults, saved) {
  const merged = defaults.map((factor) => {
    const override = Array.isArray(saved) ? saved.find((item) => item.key === factor.key) : null;
    return {
      ...factor,
      ...override,
      value: Number(override?.value ?? factor.defaultValue),
      defaultValue: Number(factor.defaultValue),
      method: override?.method || factor.method || mapBasisToMethod(override?.basis),
      inputUnit: override?.inputUnit || factor.inputUnit,
      category: override?.category || factor.category,
      subcategory: override?.subcategory || factor.subcategory,
      source: override?.source || factor.source,
      region: override?.region || factor.region,
      validFrom: override?.validFrom || factor.validFrom,
    };
  });

  (Array.isArray(saved) ? saved : [])
    .filter((item) => item?.key && !merged.some((factor) => factor.key === item.key))
    .forEach((item) => {
      if (!item.module || !item.ghgScope || !item.activity) {
        return;
      }
      merged.push({
        key: item.key,
        module: item.module,
        category: item.category || item.module,
        subcategory: item.subcategory || item.activity,
        ghgScope: item.ghgScope,
        method: item.method || mapBasisToMethod(item.basis),
        activity: item.activity,
        inputUnit: item.inputUnit || guessInputUnitFromLabel(item.unitLabel) || "unit",
        defaultValue: Number(item.value || 0),
        value: Number(item.value || 0),
        unitLabel: item.unitLabel || "kg CO2e / unit",
        source: item.source || "Imported",
        region: item.region || "",
        validFrom: item.validFrom || "",
      });
    });

  return merged;
}

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(state.entries));
  localStorage.setItem(STORAGE_KEYS.buildings, JSON.stringify(state.buildings));
  localStorage.setItem(
    STORAGE_KEYS.factors,
    JSON.stringify(state.factors.map(({
      key, module, category, subcategory, ghgScope, method, activity, inputUnit, value, unitLabel, source, region, validFrom,
    }) => ({
      key,
      module,
      category,
      subcategory,
      ghgScope,
      method,
      activity,
      inputUnit,
      value,
      unitLabel,
      source,
      region,
      validFrom,
    }))),
  );
}

function populateModuleOptions() {
  const modules = [...new Set(state.factors.map((factor) => factor.module))];
  elements.moduleSelect.replaceChildren(
    ...modules.map((module) => {
      const opt = document.createElement("option");
      opt.value = module;
      opt.textContent = module;
      return opt;
    })
  );
  populateActivityOptions(modules[0]);
}

function populateBuildingOptions() {
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Not linked to a building";
  elements.buildingSelect.replaceChildren(
    placeholder,
    ...state.buildings.map((building) => {
      const opt = document.createElement("option");
      opt.value = building.id;
      opt.textContent = building.name;
      return opt;
    })
  );
}

function populateActivityOptions(selectedModule) {
  const factors = state.factors.filter((factor) => factor.module === selectedModule);
  elements.activitySelect.replaceChildren(
    ...factors.map((factor) => {
      const opt = document.createElement("option");
      opt.value = factor.key;
      opt.textContent = `${factor.activity} · ${factor.inputUnit}`;
      return opt;
    })
  );
  syncEntryFactorMeta();
}

function getSelectedFactor() {
  return state.factors.find((item) => item.key === elements.activitySelect.value)
    || state.factors.find((item) => item.module === elements.moduleSelect.value)
    || null;
}

function syncEntryFactorMeta() {
  const factor = getSelectedFactor();
  elements.ghgScopeInput.value = factor?.ghgScope || "";
  if (factor?.inputUnit) {
    elements.unitInput.placeholder = factor.inputUnit;
    if (!elements.unitInput.value) {
      elements.unitInput.value = factor.inputUnit;
    }
  }

  if (factor?.module === "Building" && !elements.ownerShareInput.value && !elements.tenantShareInput.value) {
    const building = state.buildings.find((item) => item.id === elements.buildingSelect.value);
    const split = inferOwnershipSplit(building);
    elements.ownerShareInput.value = split.ownerSharePct;
    elements.tenantShareInput.value = split.tenantSharePct;
    elements.reportedBySelect.value = split.reportedBy;
  }

  elements.factorHint.textContent = factor
    ? `${factor.category} → ${factor.subcategory} • ${factor.method} method • expected unit ${factor.inputUnit}`
    : "Select an activity to lock unit and factor.";
  elements.validationHint.textContent = "";
}

function renderFactors() {
  elements.factorTable.innerHTML = "";

  state.factors.forEach((factor) => {
    const fragment = elements.factorRowTemplate.content.cloneNode(true);
    const row = fragment.querySelector(".factor-row");
    const label = fragment.querySelector(".factor-label");
    const meta = fragment.querySelector(".factor-meta");
    const input = fragment.querySelector(".factor-input");

    label.textContent = `${factor.module} · ${factor.activity}`;
    meta.textContent = `${factor.ghgScope} • ${factor.category}/${factor.subcategory} • ${factor.method} • ${factor.inputUnit} • ${factor.unitLabel}`;
    input.value = factor.value;
    input.dataset.factorKey = factor.key;

    input.addEventListener("input", (event) => {
      const nextValue = Number(event.target.value);
      const current = state.factors.find((item) => item.key === factor.key);
      current.value = Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : 0;
      persist();
      renderRecords();
      renderSummary();
      renderBuildings();
    });

    row.dataset.factorKey = factor.key;
    elements.factorTable.appendChild(fragment);
  });
}

function renderBuildings() {
  elements.buildingTable.innerHTML = "";
  if (!state.buildings.length) {
    elements.buildingTable.innerHTML = '<p class="hint">No buildings configured yet.</p>';
    return;
  }

  const rows = state.buildings.map((building) => {
    const totals = state.entries
      .filter((entry) => entry.buildingId === building.id)
      .map((entry) => calculateEmission(entry))
      .filter((result) => result.status === "ok");

    const total = totals.reduce((sum, result) => sum + result.emission, 0);
    const ownerTotal = totals.reduce((sum, result) => sum + result.ownerEmission, 0);
    const tenantTotal = totals.reduce((sum, result) => sum + result.tenantEmission, 0);
    const intensity = building.grossFloorAreaM2 > 0 ? total / building.grossFloorAreaM2 : 0;

    return `
      <div class="factor-row">
        <div>
          <strong class="factor-label">${escapeHtml(building.name)}</strong>
          <p class="factor-meta">${formatNumber(building.grossFloorAreaM2)} m² gross • ${formatNumber(building.netLeasedAreaM2)} m² leased • ${escapeHtml(building.ownershipType)} • ${escapeHtml(building.energyControl)} • ${escapeHtml(building.heatingType)}</p>
        </div>
        <div>
          <strong>${formatNumber(total)} kg</strong>
          <p class="factor-meta">Owner ${formatNumber(ownerTotal)} kg • Tenant ${formatNumber(tenantTotal)} kg • ${formatNumber(intensity)} kg CO2e / m²</p>
        </div>
      </div>
    `;
  });

  elements.buildingTable.innerHTML = rows.join("");
}

function addCustomFactor(event) {
  event.preventDefault();
  const formData = new FormData(elements.factorForm);
  const module = formData.get("module")?.toString().trim();
  const ghgScope = formData.get("ghgScope")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const subcategory = formData.get("subcategory")?.toString().trim();
  const activity = formData.get("activity")?.toString().trim();
  const method = formData.get("method")?.toString().trim();
  const value = Number(formData.get("value") || 0);
  const inputUnit = formData.get("inputUnit")?.toString().trim();
  const unitLabel = formData.get("unitLabel")?.toString().trim();
  const source = formData.get("source")?.toString().trim();
  const region = formData.get("region")?.toString().trim();
  const validFrom = formData.get("validFrom")?.toString().trim();

  if (!module || !ghgScope || !activity || !method || !unitLabel || !inputUnit) {
    return;
  }

  const key = `${module}-${ghgScope}-${activity}-${region}-${validFrom}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = state.factors.find((factor) => factor.key === key);
  const nextFactor = {
    key,
    module,
    ghgScope,
    category: category || module,
    subcategory: subcategory || activity,
    method,
    activity,
    inputUnit,
    defaultValue: value,
    value,
    unitLabel,
    source: source || "Manual",
    region: region || "",
    validFrom: validFrom || "",
  };

  if (existing) {
    Object.assign(existing, nextFactor);
  } else {
    state.factors.push(nextFactor);
  }

  persist();
  populateModuleOptions();
  renderFactors();
  renderRecords();
  renderSummary();
  elements.factorForm.reset();
}

function addBuilding(event) {
  event.preventDefault();
  const formData = new FormData(elements.buildingForm);
  const name = formData.get("name")?.toString().trim();
  const grossFloorAreaM2 = Number(formData.get("grossFloorAreaM2") || 0);
  const netLeasedAreaM2 = Number(formData.get("netLeasedAreaM2") || 0);
  const ownershipType = formData.get("ownershipType")?.toString().trim();
  const energyControl = formData.get("energyControl")?.toString().trim();
  const heatingType = formData.get("heatingType")?.toString().trim();

  if (!name || !grossFloorAreaM2) {
    return;
  }

  const id = slugify(name);
  const existing = state.buildings.find((item) => item.id === id);
  const nextBuilding = {
    id,
    name,
    grossFloorAreaM2,
    netLeasedAreaM2,
    ownershipType: ownershipType || "owner-occupied",
    energyControl: energyControl || "owner",
    heatingType: heatingType || "other",
  };

  if (existing) {
    Object.assign(existing, nextBuilding);
  } else {
    state.buildings.push(nextBuilding);
  }

  persist();
  populateBuildingOptions();
  renderBuildings();
  renderSummary();
  elements.buildingForm.reset();
}

function getFactorByKey(key) {
  return state.factors.find((factor) => factor.key === key) || null;
}

function inferFactorRef(entry) {
  if (entry.factorRef && getFactorByKey(entry.factorRef)) {
    return entry.factorRef;
  }
  const match = state.factors.find((factor) =>
    factor.module === entry.module
    && factor.activity === entry.activity
    && (!entry.ghgScope || factor.ghgScope === entry.ghgScope));
  return match?.key || "";
}

function inferOwnershipSplit(building) {
  if (!building) {
    return { ownerSharePct: 100, tenantSharePct: 0, reportedBy: "organization" };
  }
  if (building.energyControl === "owner") {
    return { ownerSharePct: 100, tenantSharePct: 0, reportedBy: "building_owner" };
  }
  if (building.energyControl === "tenant") {
    return { ownerSharePct: 0, tenantSharePct: 100, reportedBy: "tenant" };
  }
  return { ownerSharePct: 50, tenantSharePct: 50, reportedBy: "shared_meter" };
}

function calculateEmission(entry) {
  const factor = getFactorByKey(entry.factorRef || inferFactorRef(entry));
  if (!factor) {
    return { emission: 0, ownerEmission: 0, tenantEmission: 0, status: "missing-factor", message: "Missing factor" };
  }

  const entryUnit = (entry.unit || "").trim();
  if (factor.inputUnit && entryUnit && factor.inputUnit !== entryUnit) {
    return {
      emission: 0,
      ownerEmission: 0,
      tenantEmission: 0,
      status: "unit-mismatch",
      message: `Expected ${factor.inputUnit}, got ${entryUnit}`,
    };
  }

  const baseValue = factor.method === "spend" ? Number(entry.amount || 0) : Number(entry.quantity || 0);
  const emission = round(baseValue * Number(factor.value || 0), 3);
  const ownerSharePct = clampPct(entry.ownerSharePct);
  const tenantSharePct = clampPct(entry.tenantSharePct);
  const ownerEmission = round(emission * ownerSharePct / 100, 3);
  const tenantEmission = round(emission * tenantSharePct / 100, 3);

  return {
    emission,
    ownerEmission,
    tenantEmission,
    status: "ok",
    message: "",
  };
}

function renderRecords() {
  elements.recordsBody.innerHTML = "";

  if (!state.entries.length) {
    elements.recordsBody.innerHTML = `<tr><td colspan="14">No records loaded yet.</td></tr>`;
    elements.recordCount.textContent = "0";
    return;
  }

  state.entries.forEach((entry, index) => {
    const result = calculateEmission(entry);
    const factor = getFactorByKey(entry.factorRef);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(entry.date || "")}</td>
      <td>${escapeHtml(entry.vendor || "")}</td>
      <td>${escapeHtml(entry.module || "")}</td>
      <td>${escapeHtml(entry.category || "")}</td>
      <td>${escapeHtml(entry.ghgScope || "")}</td>
      <td>${escapeHtml(entry.activity || "")}</td>
      <td>${escapeHtml(entry.buildingId || "")}</td>
      <td>${escapeHtml(formatOwnershipLabel(entry))}</td>
      <td>${escapeHtml(formatMobilityLabel(entry))}</td>
      <td>${formatNumber(entry.quantity)}</td>
      <td>${escapeHtml(entry.unit || "")}</td>
      <td>${formatNumber(result.emission)}</td>
      <td>${result.status === "ok" ? escapeHtml(factor?.key || "") : `<span class="status-pill error">${escapeHtml(result.message)}</span>`}</td>
      <td><button class="delete-button" type="button" data-index="${index}">Delete</button></td>
    `;
    elements.recordsBody.appendChild(row);
  });

  elements.recordsBody.querySelectorAll(".delete-button").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      state.entries.splice(index, 1);
      persist();
      renderRecords();
      renderBuildings();
      renderSummary();
    });
  });

  elements.recordCount.textContent = String(state.entries.length);
}

function renderSummary() {
  const moduleTotals = {
    Building: 0,
    Personnel: 0,
    Waste: 0,
    Travel: 0,
  };
  const scopeTotals = {
    "Scope 1": 0,
    "Scope 2": 0,
    "Scope 3": 0,
  };

  const ownershipTotals = {
    owner: 0,
    tenant: 0,
  };

  const mobilityTotals = {
    commuting: 0,
    businessTravel: 0,
  };

  let buildingArea = 0;
  const referencedBuildings = new Set();

  state.entries.forEach((entry) => {
    const { emission, ownerEmission, tenantEmission, status } = calculateEmission(entry);
    if (status !== "ok") {
      return;
    }
    if (moduleTotals[entry.module] !== undefined) {
      moduleTotals[entry.module] += emission;
    }
    if (scopeTotals[entry.ghgScope] !== undefined) {
      scopeTotals[entry.ghgScope] += emission;
    }
    if (entry.module === "Building") {
      ownershipTotals.owner += ownerEmission;
      ownershipTotals.tenant += tenantEmission;
    }
    if (entry.module === "Personnel" && entry.category === "Commuting") {
      mobilityTotals.commuting += emission;
    }
    if (entry.module === "Travel") {
      mobilityTotals.businessTravel += emission;
    }
    if (entry.module === "Building" && entry.buildingId && !referencedBuildings.has(entry.buildingId)) {
      const building = state.buildings.find((item) => item.id === entry.buildingId);
      if (building?.grossFloorAreaM2) {
        buildingArea += Number(building.grossFloorAreaM2);
        referencedBuildings.add(entry.buildingId);
      }
    }
  });

  const total = Object.values(moduleTotals).reduce((sum, value) => sum + value, 0);
  const intensity = buildingArea > 0 ? moduleTotals.Building / buildingArea : 0;

  elements.totalEmissions.textContent = formatNumber(total);
  elements.summaryScope1.textContent = `${formatNumber(scopeTotals["Scope 1"])} kg`;
  elements.summaryScope2.textContent = `${formatNumber(scopeTotals["Scope 2"])} kg`;
  elements.summaryScope3.textContent = `${formatNumber(scopeTotals["Scope 3"])} kg`;
  elements.summaryBuilding.textContent = `${formatNumber(moduleTotals.Building)} kg`;
  elements.summaryPersonnel.textContent = `${formatNumber(moduleTotals.Personnel)} kg`;
  elements.summaryWaste.textContent = `${formatNumber(moduleTotals.Waste)} kg`;
  elements.summaryTravel.textContent = `${formatNumber(moduleTotals.Travel)} kg`;
  elements.summaryIntensity.textContent = buildingArea > 0
    ? `${formatNumber(intensity)} kg/m²`
    : "Link building records to area";
  elements.summaryOwner.textContent = `${formatNumber(ownershipTotals.owner)} kg`;
  elements.summaryTenant.textContent = `${formatNumber(ownershipTotals.tenant)} kg`;
  elements.summaryCommuting.textContent = `${formatNumber(mobilityTotals.commuting)} kg`;
  elements.summaryBusinessTravel.textContent = `${formatNumber(mobilityTotals.businessTravel)} kg`;
}

function onSubmitEntry(event) {
  event.preventDefault();
  const formData = new FormData(elements.entryForm);
  const factor = getFactorByKey(formData.get("activity")?.toString().trim());

  if (!factor) {
    elements.validationHint.textContent = "Please select a valid factor-backed activity.";
    return;
  }

  const unit = formData.get("unit")?.toString().trim() || factor.inputUnit;
  if (factor.inputUnit && unit !== factor.inputUnit) {
    elements.validationHint.textContent = `Unit mismatch. ${factor.activity} expects ${factor.inputUnit}.`;
    return;
  }

  const buildingId = formData.get("buildingId")?.toString().trim() || "";
  const building = state.buildings.find((item) => item.id === buildingId);
  const split = inferOwnershipSplit(building);
  const ownerSharePct = formData.get("ownerSharePct") === "" ? split.ownerSharePct : Number(formData.get("ownerSharePct"));
  const tenantSharePct = formData.get("tenantSharePct") === "" ? split.tenantSharePct : Number(formData.get("tenantSharePct"));

  if (factor.module === "Building" && round(ownerSharePct + tenantSharePct, 2) !== 100) {
    elements.validationHint.textContent = "Building owner share and tenant share must total 100%.";
    return;
  }

  const entry = normalizeEntry({
    id: crypto.randomUUID ? crypto.randomUUID() : `rec-${Date.now()}`,
    date: formData.get("date"),
    vendor: formData.get("vendor")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    module: factor.module,
    category: factor.category,
    subcategory: factor.subcategory,
    ghgScope: factor.ghgScope,
    activity: factor.activity,
    factorRef: factor.key,
    calculationMethod: factor.method,
    amount: Number(formData.get("amount") || 0),
    quantity: Number(formData.get("quantity") || 0),
    unit,
    buildingId,
    ownerSharePct,
    tenantSharePct,
    reportedBy: formData.get("reportedBy")?.toString().trim() || split.reportedBy,
    transportMode: formData.get("transportMode")?.toString().trim() || "",
    travelerCount: Number(formData.get("travelerCount") || 0),
    nights: Number(formData.get("nights") || 0),
    roundTrip: parseBoolean(formData.get("roundTrip")),
    employeesCovered: Number(formData.get("employeesCovered") || 0),
    surveyPeriod: formData.get("surveyPeriod")?.toString().trim() || "",
    notes: formData.get("notes")?.toString().trim() || "",
  });

  if (!entry) {
    return;
  }

  state.entries.unshift(entry);
  persist();
  elements.entryForm.reset();
  elements.entryForm.elements.module.value = factor.module;
  populateActivityOptions(factor.module);
  populateBuildingOptions();
  renderRecords();
  renderBuildings();
  renderSummary();
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]).map((item) => item.trim().toLowerCase());

  return lines.slice(1).filter(Boolean).map((line) => {
    const values = splitCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    return normalizeEntry({
      id: row.id || (crypto.randomUUID ? crypto.randomUUID() : `csv-${Date.now()}-${Math.random()}`),
      date: row.date || "",
      vendor: row.vendor || "",
      description: row.description || "",
      module: row.module || row.scope || "",
      category: row.category || "",
      subcategory: row.subcategory || "",
      ghgScope: row.ghg_scope || row.ghgscope || "",
      activity: row.activity || "",
      factorRef: row.factor_ref || row.factorkey || "",
      calculationMethod: row.calculation_method || row.method || "",
      amount: Number(row.amount || 0),
      quantity: Number(row.quantity || 0),
      unit: row.unit || "",
      buildingId: row.building_id || row.buildingid || "",
      ownerSharePct: Number(row.owner_share_pct || row.ownersharepct || 0),
      tenantSharePct: Number(row.tenant_share_pct || row.tenantsharepct || 0),
      reportedBy: row.reported_by || row.reportedby || "",
      transportMode: row.transport_mode || row.transportmode || "",
      travelerCount: Number(row.traveler_count || row.travelercount || 0),
      nights: Number(row.nights || 0),
      roundTrip: parseBoolean(row.round_trip || row.roundtrip),
      employeesCovered: Number(row.employees_covered || row.employeescovered || 0),
      surveyPeriod: row.survey_period || row.surveyperiod || "",
      notes: row.notes || "",
    });
  }).filter(Boolean);
}

function splitCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (character === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += character;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function importCsv(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const records = parseCsv(String(reader.result || ""));
    state.entries = [...records, ...state.entries];
    persist();
    renderRecords();
    renderBuildings();
    renderSummary();
  };
  reader.readAsText(file);
}

function importFactors(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const imported = safeJsonParse(String(reader.result || ""), []);
    if (!Array.isArray(imported)) {
      return;
    }

    imported.forEach((item) => {
      const normalized = {
        key: item.key,
        module: item.module,
        category: item.category || item.module,
        subcategory: item.subcategory || item.activity,
        ghgScope: item.ghgScope || item.scope,
        method: item.method || mapBasisToMethod(item.basis),
        activity: item.activity,
        inputUnit: item.inputUnit || guessInputUnitFromLabel(item.unitLabel) || "unit",
        defaultValue: Number(item.value || 0),
        value: Number(item.value || 0),
        unitLabel: item.unitLabel || "kg CO2e / unit",
        source: item.source || "Imported",
        region: item.region || "",
        validFrom: item.validFrom || "",
      };

      if (!normalized.key || !normalized.module || !normalized.ghgScope || !normalized.activity) {
        return;
      }

      const match = state.factors.find((factor) => factor.key === normalized.key);
      if (match) {
        Object.assign(match, normalized);
      } else {
        state.factors.push(normalized);
      }
    });

    persist();
    populateModuleOptions();
    renderFactors();
    renderRecords();
    renderSummary();
  };
  reader.readAsText(file);
}

function downloadFactors() {
  const payload = JSON.stringify(
    state.factors.map(({
      key, module, category, subcategory, ghgScope, method, activity, inputUnit, value, unitLabel, source, region, validFrom,
    }) => ({
      key,
      module,
      category,
      subcategory,
      ghgScope,
      method,
      activity,
      inputUnit,
      value,
      unitLabel,
      source,
      region,
      validFrom,
    })),
    null,
    2,
  );
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "co2-emission-factors.json";
  link.click();
  URL.revokeObjectURL(url);
}

function resetData() {
  state.entries = [];
  persist();
  renderRecords();
  renderBuildings();
  renderSummary();
}

function loadSampleData() {
  state.entries = parseCsv(SAMPLE_CSV);
  persist();
  renderRecords();
  renderBuildings();
  renderSummary();
}

function formatNumber(value) {
  return Number(value || 0).toFixed(2);
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clampPct(value) {
  const number = Number(value || 0);
  return Math.max(0, Math.min(100, number));
}

function parseBoolean(value) {
  if (value === true || value === false) {
    return value;
  }
  const normalized = String(value || "").trim().toLowerCase();
  if (["true", "yes", "1"].includes(normalized)) {
    return true;
  }
  if (["false", "no", "0"].includes(normalized)) {
    return false;
  }
  return false;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatOwnershipLabel(entry) {
  if (entry.module !== "Building") {
    return "—";
  }
  return `O ${formatNumber(entry.ownerSharePct)}% / T ${formatNumber(entry.tenantSharePct)}%`;
}

function formatMobilityLabel(entry) {
  if (entry.module === "Personnel" && entry.category === "Commuting") {
    const count = entry.employeesCovered ? `${entry.employeesCovered} people` : "survey";
    return `${entry.transportMode || "commute"} • ${count}`;
  }
  if (entry.module === "Travel") {
    const travelers = entry.travelerCount ? `${entry.travelerCount} traveler` : "travel";
    const tripFlag = entry.roundTrip ? "round trip" : "one way";
    return `${entry.transportMode || "business"} • ${travelers} • ${tripFlag}`;
  }
  return "—";
}

function normalizeEntry(entry) {
  if (!entry) {
    return null;
  }

  const normalized = {
    id: entry.id || (crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}-${Math.random()}`),
    date: entry.date || "",
    vendor: entry.vendor || "",
    description: entry.description || "",
    module: entry.module || entry.scope || "",
    category: entry.category || "",
    subcategory: entry.subcategory || "",
    ghgScope: entry.ghgScope || entry.ghg_scope || "",
    activity: entry.activity || "",
    factorRef: entry.factorRef || "",
    calculationMethod: entry.calculationMethod || entry.method || "",
    amount: Number(entry.amount || 0),
    quantity: Number(entry.quantity || 0),
    unit: entry.unit || "",
    buildingId: entry.buildingId || entry.building_id || "",
    ownerSharePct: Number(entry.ownerSharePct || entry.owner_share_pct || 0),
    tenantSharePct: Number(entry.tenantSharePct || entry.tenant_share_pct || 0),
    reportedBy: entry.reportedBy || entry.reported_by || "",
    transportMode: entry.transportMode || entry.transport_mode || "",
    travelerCount: Number(entry.travelerCount || entry.traveler_count || 0),
    nights: Number(entry.nights || 0),
    roundTrip: parseBoolean(entry.roundTrip || entry.round_trip),
    employeesCovered: Number(entry.employeesCovered || entry.employees_covered || 0),
    surveyPeriod: entry.surveyPeriod || entry.survey_period || "",
    notes: entry.notes || "",
  };

  const factor = getFactorByKey(normalized.factorRef) || state.factors.find((item) =>
    item.module === normalized.module
    && item.activity === normalized.activity
    && (!normalized.ghgScope || item.ghgScope === normalized.ghgScope));

  if (factor) {
    normalized.factorRef = factor.key;
    normalized.module = normalized.module || factor.module;
    normalized.category = normalized.category || factor.category;
    normalized.subcategory = normalized.subcategory || factor.subcategory;
    normalized.ghgScope = normalized.ghgScope || factor.ghgScope;
    normalized.activity = normalized.activity || factor.activity;
    normalized.calculationMethod = normalized.calculationMethod || factor.method;
    normalized.unit = normalized.unit || factor.inputUnit;
  }

  if (normalized.module === "Building") {
    const building = state.buildings.find((item) => item.id === normalized.buildingId);
    const split = inferOwnershipSplit(building);
    normalized.ownerSharePct = normalized.ownerSharePct || split.ownerSharePct;
    normalized.tenantSharePct = normalized.tenantSharePct || split.tenantSharePct;
    normalized.reportedBy = normalized.reportedBy || split.reportedBy;
  }

  if (!normalized.module || !normalized.activity || !normalized.ghgScope) {
    return null;
  }

  return normalized;
}

function attachEvents() {
  elements.moduleSelect.addEventListener("change", (event) => {
    populateActivityOptions(event.target.value);
  });
  elements.activitySelect.addEventListener("change", syncEntryFactorMeta);
  elements.buildingSelect.addEventListener("change", syncEntryFactorMeta);

  elements.entryForm.addEventListener("submit", onSubmitEntry);
  elements.factorForm.addEventListener("submit", addCustomFactor);
  elements.buildingForm.addEventListener("submit", addBuilding);

  elements.csvFile.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) {
      importCsv(file);
      event.target.value = "";
    }
  });

  elements.factorFile.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) {
      importFactors(file);
      event.target.value = "";
    }
  });

  elements.loadSample.addEventListener("click", loadSampleData);
  elements.resetData.addEventListener("click", resetData);
  elements.downloadFactors.addEventListener("click", downloadFactors);
}

function guessInputUnitFromLabel(unitLabel) {
  const match = String(unitLabel || "").split("/")[1];
  return match ? match.trim() : "";
}

function mapBasisToMethod(basis) {
  return basis === "amount" ? "spend" : "activity";
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function init() {
  hydrateState();
  populateModuleOptions();
  populateBuildingOptions();
  renderFactors();
  renderBuildings();
  renderRecords();
  renderSummary();
  attachEvents();

  if (state.factors[0]) {
    elements.entryForm.elements.module.value = state.factors[0].module;
    populateActivityOptions(state.factors[0].module);
  }
}

init();
