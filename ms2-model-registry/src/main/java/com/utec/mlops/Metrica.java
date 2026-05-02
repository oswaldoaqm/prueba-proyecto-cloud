package com.utec.mlops;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Metrica {
    @JsonProperty("metrica_id") public Integer metricaId;
    @JsonProperty("modelo_id") public Integer modeloId;
    @JsonProperty("tipo_metrica") public String tipoMetrica;
    @JsonProperty("valor_metrica") public Double valorMetrica;
    @JsonProperty("fecha_registro") public String fechaRegistro;
}