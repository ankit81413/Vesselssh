## VesselSSH

VesselSSH is an open-source DevOps tool designed to provide a desktop-like experience directly in your browser. It brings server management and development tools together in one place, allowing users to interact with their server through a unified interface instead of switching between multiple applications.<br>

> [!NOTE]
> ## Usage Note
> VesselSSH is currently under active development. At this stage, we do not recommend using it on servers shared by multiple users.<br>
> Although VesselSSH has its own authentication system, its permissions and access controls are not yet user-specific. For now, it is intended for single-user environments where one trusted user manages the server.
<br>
The goal of VesselSSH is to make server management and development simpler, more accessible, and more convenient.
<br>
<br>

| Screenshot 1 | Screenshot 2 |
|---|---|
| ![VesselSSH Overview](https://ankit81413.github.io/VesselDoc/images/Screenshot%202026-10-16%20192744.png) | ![VesselSSH Overview](https://ankit81413.github.io/VesselDoc/images/Screenshot%202026-10-16%20192848.png) |


<br>

## What VesselSSH Offers
The VesselSSH MVP provides a simple, lightweight, and user-friendly desktop environment accessible directly through your browser. It currently includes the following system applications:

**1. Terminal**
<br>
VesselSSH provides a browser-based terminal built with xterm.js and node-pty, connected through WebSockets. It allows you to interact with your server's command line directly from the desktop environment.
<br>
<br>
**2. VS Code (code-server)** <br>
VesselSSH integrates code-server, bringing the VS Code development experience directly into your browser.
It is launched through VesselSSH's background job service, allowing you to work with your server's source code in a full editor instead of relying on basic terminal tools such as nano or cat.
<br><br>
**3. File Manager** <br>
VesselSSH currently uses Quantum File Browser to provide access to server files through a browser-based interface. You can browse, download, edit, and delete files.
We are also working on developing our own native VesselSSH File Manager. Until it is ready, Quantum File Browser serves as the file management solution.
<br><br>

## Development Status & Release Plan
VesselSSH is actively under development, and new features and improvements are being added continuously.

Our next major milestone is implementing user-specific permissions and access controls. Once this system is complete and the release requirements are met, we aim to publish VesselSSH v1.0.0.
<br><br>

## Contributions
We welcome contributions from developers who want to help improve VesselSSH, especially as we work toward our first stable release.

You can contribute by reporting bugs, suggesting features, improving documentation, or submitting pull requests.

<br><br>

## Contact
Have questions, suggestions, or ideas? Feel free to connect.

 * LinkedIn: [`linkedin.com/in/ankit81413/`](https://www.linkedin.com/in/ankit81413/)
 * Email: [`ankitsen81413@gmail.com`](mailto:ankitsen81413@gmail.com)
 
