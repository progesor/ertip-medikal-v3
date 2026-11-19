import assert from "node:assert/strict";
import test from "node:test";
import {catalogOptions} from "../../src/lib/catalog/options";

test("55 punch combinations become two groups without inventing unavailable sizes", () => {
  const diameters=["0.6","0.65","0.7","0.75","0.8","0.85","0.9","0.95","1.0","1.2","1.3"];
  const lengths=["2.5","3","3.5","4","5"];
  const options=catalogOptions({
    attributes:[{name:"Çap",values:diameters.join("-")},{name:"Uzunluk",values:lengths.join("-")}],
    variants:diameters.flatMap(d=>lengths.map(l=>({title:d+" mm Çap - "+l+" mm Uzunluk",isActive:true}))),
  },"tr");
  assert.equal(options.length,2);
  assert.equal(options[0].value,diameters.join(" · "));
  assert.equal(options[1].value,lengths.join(" · "));
  assert.ok(!options[0].value.includes("1.1"));
});
test("disabled options are excluded and English group labels are translated", () => {
  const options=catalogOptions({
    attributes:[{id:"a",name:"Renk",values:"Beyaz-Gri"}],
    variants:[
      {title:"Beyaz",isActive:true,combinationKey:JSON.stringify([["id:a","Beyaz"]])},
      {title:"Gri",isActive:false,combinationKey:JSON.stringify([["id:a","Gri"]])},
    ],
  },"en");
  assert.deepEqual(options,[{key:"Color",value:"White"}]);
});
