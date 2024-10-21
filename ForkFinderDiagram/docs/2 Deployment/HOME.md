# 2 Deployment

![diagram](https://www.plantuml.com/plantuml/svg/0/rLPHJniv47v7uZ_CxSi1Mf8IeQgwfuQarmOH4h7Xk4gLqAmzsVNXjIrxDYbtuhzNtaq8uO9qqAVBaptnDvxlcndFVWoCdkjAx-_zeepGjIGecLtuhTlrkEmKYiiwhmDvOGsJuOwmLHUbLsWMkdPrTt1wFDLe-7fyqTN85BWxEBqTajFslee0rtZVtxleVvrSpsvlHhCljnUVFd-w71uSHllcwEsbbNJWj4WXELC5dA6v0wT5ycmF4Xb1a67ooU4_-ti00C_TI9D2agiYHtDtZ4uT7Hrzu-yVeg_hl3PSmydxphjJk9XbZpvs-K67egGKadwpW9cj17Bot00VEj-t_CJVm1f6PSWVe5CHCHr1tpcj1BAo9ZevnmK26WcPyyeKCFvZ4CrJRnTAKe1H96c86_BnmBms8e9HAxw7XK90ECycbzqlizaqW_vqr4aEDs4yjCk7tIAjz97vkvCdQiNjgtMo7eMEEasQ1Hp3rAiA_NsoiPtqnCiQ3VC3cQUG394nnq0HTqKQMxAmDaCcIgem_fknzHGWLYTuAbHWtvm6PURMLyqwXH93IHAmvf8ChwG7uKd6BUgG0Wf18O2sHKY1MBn9mTwsWhqtAjXxAc56mXhvMX5x_pyLywVgBIblk_NqZTtQ-zbsNLAin1lA_sEx3ach1Va0N184HbO2LWzcSpgQ_zN9GPb24pWi271ppGkoFUnwAoiRunpKWMr5_jS0bSsL9f2qK89QrauJZ2OPM0zz8xrLyf7uXd2BIo4PjmxwpaNqdrYXLsRhHKBGgb9C4aAT1sAmyztyjbygjY1MSORcsUAIbDyEkA6-awYmbTjc6Yrr700nQEM53NRESAECjCiGOsgPLoWcsOj38lTs6SYlSdtMxgB7pzR6t0nARojAOMp_LbeZ_AuypUrsvMn430vZFxLfdSQqxgYUJ7ZbsghecwBMwBVLrVhd15rI3YjQZvMqBfyhqe-PRYVI6EyenA410hKEm3P6yrUmffqdqKD4DTHU1sbwg9LaqnwsOIOsQNmIxXhONDECWYj26M3kRTNejVIAQNtX-V1iy0pHUmKa-byZsXnHQByhs2RDTyb7ChAkz0y0)

**Deployment diagram**

A deployment diagram allows you to illustrate how containers in the static model are mapped to infrastructure. This deployment diagram is based upon a UML deployment diagram, although simplified slightly to show the mapping between containers and deployment nodes. A deployment node is something like physical infrastructure (e.g. a physical server or device), virtualised infrastructure (e.g. IaaS, PaaS, a virtual machine), containerised infrastructure (e.g. a Docker container), an execution environment (e.g. a database server, Java EE web/application server, Microsoft IIS), etc. Deployment nodes can be nested.

**Scope**: A single software system.

**Primary elements**: Deployment nodes and containers within the software system in scope.

**Intended audience**: Technical people inside and outside of the software development team; including software architects, developers and operations/support staff.