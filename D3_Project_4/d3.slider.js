// https://github.com/johnwalley/d3-simple-slider v1.6.5 Copyright 2020 John Walley
!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? e(
        exports,
        require("d3-array"),
        require("d3-axis"),
        require("d3-dispatch"),
        require("d3-drag"),
        require("d3-ease"),
        require("d3-scale"),
        require("d3-selection"),
        require("d3-transition")
      )
    : "function" == typeof define && define.amd
    ? define([
        "exports",
        "d3-array",
        "d3-axis",
        "d3-dispatch",
        "d3-drag",
        "d3-ease",
        "d3-scale",
        "d3-selection",
        "d3-transition",
      ], e)
    : e(
        ((t = t || self).d3 = t.d3 || {}),
        t.d3,
        t.d3,
        t.d3,
        t.d3,
        t.d3,
        t.d3,
        t.d3
      );
})(this, function (t, e, a, r, n, l, i, u) {
  "use strict";
  function s(t) {
    return "translate(" + t + ",0)";
  }
  function c(t) {
    return "translate(0," + t + ")";
  }
  function o(t, o) {
    o = void 0 !== o ? o : null;
    var f = [0],
      d = [0],
      m = [0, 10],
      h = 100,
      p = 100,
      g = !0,
      v = "M-5.5,-5.5v10l6,5.5l6,-5.5v-10z",
      k = null,
      x = null,
      y = null,
      A = null,
      w = null,
      b = null,
      D = null,
      M = r.dispatch("onchange", "start", "end", "drag"),
      q = null,
      z = null,
      F = null,
      L = 1 === t || 4 === t ? -1 : 1,
      V = 4 === t || 2 === t ? -1 : 1,
      O = 4 === t || 2 === t ? "y" : "x",
      R = 4 === t || 2 === t ? "x" : "y",
      B = 1 === t || 3 === t ? s : c,
      E = 1 === t || 3 === t ? c : s,
      P = null;
    switch (t) {
      case 1:
        P = a.axisTop;
        break;
      case 2:
        P = a.axisRight;
        break;
      case 3:
        P = a.axisBottom;
        break;
      case 4:
        P = a.axisLeft;
    }
    var T = null,
      j = null;
    function H(a) {
      (q = a.selection ? a.selection() : a),
        (o = o
          ? o.range([
              e.min(o.range()),
              e.min(o.range()) + (1 === t || 3 === t ? h : p),
            ])
          : (o = m[0] instanceof Date ? i.scaleTime() : i.scaleLinear())
              .domain(m)
              .range(1 === t || 3 === t ? [0, h] : [p, 0])
              .clamp(!0)),
        (z = i.scaleLinear().range(o.range()).domain(o.range()).clamp(!0)),
        (f = f.map(function (t) {
          return i.scaleLinear().range(m).domain(m).clamp(!0)(t);
        })),
        (A = A || o.tickFormat()),
        (b = b || A || o.tickFormat()),
        q
          .selectAll(".axis")
          .data([null])
          .enter()
          .append("g")
          .attr("transform", E(7 * L))
          .attr("class", "axis");
      var r = q.selectAll(".slider").data([null]),
        l = r
          .enter()
          .append("g")
          .attr("class", "slider")
          .attr("cursor", 1 === t || 3 === t ? "ew-resize" : "ns-resize")
          .call(
            n
              .drag()
              .on("start", function () {
                u.select(this).classed("active", !0);
                var a = z(3 === t || 1 === t ? u.event.x : u.event.y);
                F =
                  f[0] === m[0] && f[1] === m[0]
                    ? 1
                    : f[0] === m[1] && f[1] === m[1]
                    ? 0
                    : e.scan(
                        f.map(function (t) {
                          return Math.abs(t - U(o.invert(a)));
                        })
                      );
                var n = f.map(function (t, e) {
                  return e === F ? U(o.invert(a)) : t;
                });
                C(n), M.call("start", r, 1 === n.length ? n[0] : n), _(n, !0);
              })
              .on("drag", function () {
                var e = c(z(3 === t || 1 === t ? u.event.x : u.event.y));
                C(e), M.call("drag", r, 1 === e.length ? e[0] : e), _(e, !0);
              })
              .on("end", function () {
                u.select(this).classed("active", !1);
                var e = c(z(3 === t || 1 === t ? u.event.x : u.event.y));
                C(e),
                  M.call("end", r, 1 === e.length ? e[0] : e),
                  _(e, !0),
                  (F = null);
              })
          );
      l
        .append("line")
        .attr("class", "track")
        .attr(O + "1", o.range()[0] - 8 * V)
        .attr("stroke", "#bbb")
        .attr("stroke-width", 6)
        .attr("stroke-linecap", "round"),
        l
          .append("line")
          .attr("class", "track-inset")
          .attr(O + "1", o.range()[0] - 8 * V)
          .attr("stroke", "#eee")
          .attr("stroke-width", 4)
          .attr("stroke-linecap", "round"),
        D &&
          l
            .append("line")
            .attr("class", "track-fill")
            .attr(O + "1", 1 === f.length ? o.range()[0] - 8 * V : o(f[0]))
            .attr("stroke", D)
            .attr("stroke-width", 4)
            .attr("stroke-linecap", "round"),
        l
          .append("line")
          .attr("class", "track-overlay")
          .attr(O + "1", o.range()[0] - 8 * V)
          .attr("stroke", "transparent")
          .attr("stroke-width", 40)
          .attr("stroke-linecap", "round")
          .merge(r.select(".track-overlay"));
      var s = l
        .selectAll(".parameter-value")
        .data(f)
        .enter()
        .append("g")
        .attr("class", "parameter-value")
        .attr("transform", function (t) {
          return B(o(t));
        })
        .attr("text-anchor", 2 === t ? "start" : 4 === t ? "end" : "middle");
      function c(t) {
        var e = U(o.invert(t));
        return f.map(function (t, a) {
          return 2 === f.length
            ? a === F
              ? 0 === F
                ? Math.min(e, U(f[1]))
                : Math.max(e, U(f[0]))
              : t
            : a === F
            ? e
            : t;
        });
      }
      s
        .append("path")
        .attr("transform", "rotate(" + 90 * (t + 1) + ")")
        .attr("d", v)
        .attr("class", "handle")
        .attr("aria-label", "handle")
        .attr("aria-valuemax", m[1])
        .attr("aria-valuemin", m[0])
        .attr("aria-valuenow", f)
        .attr(
          "aria-orientation",
          4 === t || 2 === t ? "vertical" : "horizontal"
        )
        .attr("focusable", "true")
        .attr("tabindex", 0)
        .attr("fill", "white")
        .attr("stroke", "#777")
        .on("keydown", function (t, e) {
          var a = k || (m[1] - m[0]) / 100;
          function r(t) {
            return f.map(function (a, r) {
              return 2 === f.length
                ? r === e
                  ? 0 === e
                    ? Math.min(t, U(f[1]))
                    : Math.max(t, U(f[0]))
                  : a
                : r === e
                ? t
                : a;
            });
          }
          switch (u.event.key) {
            case "ArrowLeft":
            case "ArrowDown":
              H.value(r(+f[e] - a)), u.event.preventDefault();
              break;
            case "PageDown":
              H.value(r(+f[e] - 2 * a)), u.event.preventDefault();
              break;
            case "ArrowRight":
            case "ArrowUp":
              H.value(r(+f[e] + a)), u.event.preventDefault();
              break;
            case "PageUp":
              H.value(r(+f[e] + 2 * a)), u.event.preventDefault();
              break;
            case "Home":
              H.value(r(m[0])), u.event.preventDefault();
              break;
            case "End":
              H.value(r(m[1])), u.event.preventDefault();
          }
        }),
        g &&
          s
            .append("text")
            .attr(R, 27 * L)
            .attr("dy", 1 === t ? "0em" : 3 === t ? ".71em" : ".32em")
            .attr("transform", f.length > 1 ? "translate(0,0)" : null)
            .text(function (t, e) {
              return A(f[e]);
            }),
        a.select(".track").attr(O + "2", o.range()[1] + 8 * V),
        a.select(".track-inset").attr(O + "2", o.range()[1] + 8 * V),
        D &&
          a
            .select(".track-fill")
            .attr(O + "2", 1 === f.length ? o(f[0]) : o(f[1])),
        a.select(".track-overlay").attr(O + "2", o.range()[1] + 8 * V),
        a.select(".axis").call(P(o).tickFormat(A).ticks(w).tickValues(x)),
        q.select(".axis").select(".domain").remove(),
        a.select(".axis").attr("transform", E(7 * L)),
        a
          .selectAll(".axis text")
          .attr("fill", "#aaa")
          .attr(R, 20 * L)
          .attr("dy", 1 === t ? "0em" : 3 === t ? ".71em" : ".32em")
          .attr("text-anchor", 2 === t ? "start" : 4 === t ? "end" : "middle"),
        a.selectAll(".axis line").attr("stroke", "#aaa"),
        a.selectAll(".parameter-value").attr("transform", function (t) {
          return B(o(t));
        }),
        Q(),
        (j = q.selectAll(".parameter-value text")),
        (T = q.select(".track-fill"));
    }
    function Q() {
      if (q && g) {
        var t = [];
        if (
          (f.forEach(function (a) {
            var r = [];
            q.selectAll(".axis .tick").each(function (t) {
              r.push(Math.abs(t - a));
            }),
              t.push(e.scan(r));
          }),
          q.selectAll(".axis .tick text").attr("opacity", function (e, a) {
            return ~t.indexOf(a) ? 0 : 1;
          }),
          j && f.length > 1)
        ) {
          var a,
            r,
            n = [],
            l = [];
          j.nodes().forEach(function (t, e) {
            (a = t.getBoundingClientRect()),
              (r = t.getAttribute("transform").split(/[()]/)[1].split(",")[
                "x" === O ? 0 : 1
              ]),
              (n[e] = a[O] - parseFloat(r)),
              (l[e] = a["x" === O ? "width" : "height"]);
          }),
            "x" === O
              ? ((r = Math.max(0, (n[0] + l[0] - n[1]) / 2)),
                j.attr("transform", function (t, e) {
                  return "translate(" + (e ? r : -r) + ",0)";
                }))
              : ((r = Math.max(0, (n[1] + l[1] - n[0]) / 2)),
                j.attr("transform", function (t, e) {
                  return "translate(0," + (e ? -r : r) + ")";
                }));
        }
      }
    }
    function U(t) {
      if (k) {
        var a = (t - m[0]) % k,
          r = t - a;
        return 2 * a > k && (r += k), t instanceof Date ? new Date(r) : r;
      }
      if (y) {
        var n = e.scan(
          y.map(function (e) {
            return Math.abs(t - e);
          })
        );
        return y[n];
      }
      return t;
    }
    function _(t, e) {
      (f[0] !== t[0] || (f.length > 1 && f[1] !== t[1])) &&
        ((f = t), e && M.call("onchange", H, 1 === t.length ? t[0] : t), Q());
    }
    function C(t, e) {
      q &&
        ((e = void 0 !== e && e)
          ? (q
              .selectAll(".parameter-value")
              .data(t)
              .transition()
              .ease(l.easeQuadOut)
              .duration(200)
              .attr("transform", function (t) {
                return B(o(t));
              })
              .select(".handle")
              .attr("aria-valuenow", function (t) {
                return t;
              }),
            D &&
              T.transition()
                .ease(l.easeQuadOut)
                .duration(200)
                .attr(O + "1", 1 === f.length ? o.range()[0] - 8 * L : o(t[0]))
                .attr(O + "2", 1 === f.length ? o(t[0]) : o(t[1])))
          : (q
              .selectAll(".parameter-value")
              .data(t)
              .attr("transform", function (t) {
                return B(o(t));
              })
              .select(".handle")
              .attr("aria-valuenow", function (t) {
                return t;
              }),
            D &&
              T.attr(
                O + "1",
                1 === f.length ? o.range()[0] - 8 * L : o(t[0])
              ).attr(O + "2", 1 === f.length ? o(t[0]) : o(t[1]))),
        g &&
          j.text(function (e, a) {
            return b(t[a]);
          }));
    }
    return (
      o &&
        ((m = [e.min(o.domain()), e.max(o.domain())]),
        1 === t || 3 === t
          ? (h = e.max(o.range()) - e.min(o.range()))
          : (p = e.max(o.range()) - e.min(o.range())),
        (o = o.clamp(!0))),
      (H.min = function (t) {
        return arguments.length ? ((m[0] = t), H) : m[0];
      }),
      (H.max = function (t) {
        return arguments.length ? ((m[1] = t), H) : m[1];
      }),
      (H.domain = function (t) {
        return arguments.length ? ((m = t), H) : m;
      }),
      (H.width = function (t) {
        return arguments.length ? ((h = t), H) : h;
      }),
      (H.height = function (t) {
        return arguments.length ? ((p = t), H) : p;
      }),
      (H.tickFormat = function (t) {
        return arguments.length ? ((A = t), H) : A;
      }),
      (H.displayFormat = function (t) {
        return arguments.length ? ((b = t), H) : b;
      }),
      (H.ticks = function (t) {
        return arguments.length ? ((w = t), H) : w;
      }),
      (H.value = function (t) {
        if (!arguments.length) return 1 === f.length ? f[0] : f;
        var e = Array.isArray(t) ? t : [t];
        e.sort(function (t, e) {
          return t - e;
        });
        var a = e.map(o).map(z),
          r = a.map(o.invert).map(U);
        return C(r, !0), _(r, !0), H;
      }),
      (H.silentValue = function (t) {
        if (!arguments.length) return 1 === f.length ? f[0] : f;
        var e = Array.isArray(t) ? t : [t];
        e.sort(function (t, e) {
          return t - e;
        });
        var a = e.map(o).map(z),
          r = a.map(o.invert).map(U);
        return C(r, !1), _(r, !1), H;
      }),
      (H.default = function (t) {
        if (!arguments.length) return 1 === d.length ? d[0] : d;
        var e = Array.isArray(t) ? t : [t];
        return (
          e.sort(function (t, e) {
            return t - e;
          }),
          (d = e),
          (f = e),
          H
        );
      }),
      (H.step = function (t) {
        return arguments.length ? ((k = t), H) : k;
      }),
      (H.tickValues = function (t) {
        return arguments.length ? ((x = t), H) : x;
      }),
      (H.marks = function (t) {
        return arguments.length ? ((y = t), H) : y;
      }),
      (H.handle = function (t) {
        return arguments.length ? ((v = t), H) : v;
      }),
      (H.displayValue = function (t) {
        return arguments.length ? ((g = t), H) : g;
      }),
      (H.fill = function (t) {
        return arguments.length ? ((D = t), H) : D;
      }),
      (H.on = function () {
        var t = M.on.apply(M, arguments);
        return t === M ? H : t;
      }),
      H
    );
  }
  (t.sliderBottom = function (t) {
    return o(3, t);
  }),
    (t.sliderHorizontal = function (t) {
      return o(3, t);
    }),
    (t.sliderLeft = function (t) {
      return o(4, t);
    }),
    (t.sliderRight = function (t) {
      return o(2, t);
    }),
    (t.sliderTop = function (t) {
      return o(1, t);
    }),
    (t.sliderVertical = function (t) {
      return o(4, t);
    }),
    Object.defineProperty(t, "__esModule", { value: !0 });
});
