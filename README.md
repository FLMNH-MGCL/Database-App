# spesql

[![DOI](https://zenodo.org/badge/226447097.svg)](https://zenodo.org/badge/latestdoi/226447097) ![lines](https://img.shields.io/tokei/lines/github/FLMNH-MGCL/spesql?color=orange&label=Total%20Lines) ![release](https://img.shields.io/github/v/release/FLMNH-MGCL/spesql?color=green&include_prereleases&label=Latest%20Release) ![Supported Platforms](https://camo.githubusercontent.com/a50c47295f350646d08f2e1ccd797ceca3840e52/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f706c6174666f726d2d6d61634f5325323025374325323057696e646f77732532302537432532304c696e75782d6c69676874677265792e737667)

A portal for interacting with a remote MySQL database, written in TypeScript (React & Electron).

### About This Project

This project was developed for the McGuire Center of Lepidoptera and Biodiversity (MGCL) at the Florida Museum of Natural History (FLMNH). It provides researchers a portal for managing their collection datasets, hosted on remote, MySQL servers, as well as tools for summary statistic analysis.

### Installation

Please <a href="https://github.com/FLMNH-MGCL/spesql/releases" target='_blank'>select and download</a> a release for your platform (i.e. Linux, MacOS, Windows) and proceed with the traditional installation procedure for your platform. You'll need to install [UF's VPN Client](https://net-services.ufl.edu/provided-services/vpn/clients/), as well.

### Startup & Usage

Ensure your UF VPN is connected and launch the application. For detailed information about usage, please read through the official documentation: [flmnh-mgcl.github.io/spesql/docs/](https://flmnh-mgcl.github.io/spesql/docs/). This will walk you through all the available features/functions in the software.

If you do not have access credentials you may request an account in the application directly and an admin will review. If you have any other issues or concerns, please contact the <a href='https://www.floridamuseum.ufl.edu/kawahara-lab/contact/' target='_blank'>Kawahara Lab</a> directly for support. If you are an employee and need additional assistance, please refer to the instructional videos, website documentation or contact the <a href='https://www.floridamuseum.ufl.edu/kawahara-lab/contact/' target='_blank'>Kawahara Lab</a> directly, as well.

### Database Schema

The main database schema that the client assumes is largely structured from [Darwin Core](https://dwc.tdwg.org/terms/) principles.

### Known Issues / Bugs

Please refer to issues labeled with [`bug`](https://github.com/FLMNH-MGCL/spesql/issues?q=is%3Aissue+is%3Aopen+label%3Abug) to view the current list of issues that may or may not affect your usage of spesql.

### Contact / Issue Reporting

<a href='http://www.aaronbleopold.com' target="_blank">Aaron Leopold</a> developed this software. If there are any questions regarding the usage of the application, please contact him via email (aaronleopold1221@gmail.com). Additionally, if you are an employee of the FLMNH, refer to the recorded instructional videos (check `#database` in the Slack workspace) for more in-depth demonstrations. For issues relating to software bugs, glitches or unexpected errors, please submit a <a href='https://github.com/FLMNH-MGCL/spesql/issues/new/choose' target="_blank">GitHub issue</a>. Be sure to describe in
detail the errors, bugs or glitches that have occurred, and include the steps to reproduce the error. Feel free to submit issues for feature requests, as well, for any features you think should be added or changed.
