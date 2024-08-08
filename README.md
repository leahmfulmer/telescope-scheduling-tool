# telescope-scheduling-tool
With the Space Telescope Science Institute (STScI) [Space Astronomy Summer Program (SASP)](https://www.stsci.edu/opportunities/space-astronomy-summer-program), I developed software for the Hubble Space Telescope (HST) and James Webb Space Telescope (JWST) SPIKE observation scheduling systems. Specifically, I created a dynamic visualization tool for the analysis of temporal scheduling constraints, as primarily used by SPIKE Developers and SPIKE Users. The tool is designed to be lightweight (fast, computationally inexpensive), interactive (supporting zooming, scrolling, dynamic time information displays), and independent (producing a stand-alone web page) for optimized functionality and communication among users. Please find here [an example of the tool](https://raw.githack.com/leahmfulmer/telescope-scheduling-tool/main/code/index.html) with a given set of scheduling constraints, [documentation](documentation.pdf), and my Summer Student Symposium presentation as both a [slide deck](symposium-presentation.pptx) and a [talk](https://cloudproject.hosted.panopto.com/Panopto/Pages/Viewer.aspx?id=3ffd29cd-8277-4512-bb1c-a996002cda01&query=leah%20fulmer).

_Please note:_ This tool was developed within [SPIKE](https://www.stsci.edu/scientific-community/software/spike), a planning and scheduling toolkit for astronmical obseravtions. SPIKE was developed by STScI and is used for its flagship missions HST and JWST. My tool was written in LISP, instructing SPIKE to accept a list of scheduling constraints and output a single file that contained all of the relevant code (HTML, JavaScript, and CSS) to visualize those input constraints. This reduced the number of output files, making it easier for schedulers to pass a particular visualization between one another. To share this work, I took an example output visualization and divided it into independent .html, .js, and .css files for greater readability. The code shared here is therefore an _example_ of the potential use of this tool, rather than the original tool in its entirety.
