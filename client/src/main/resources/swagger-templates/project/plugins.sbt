addSbtPlugin("com.eed3si9n" % "sbt-assembly" % "2.1.1")

libraryDependencies <+= sbtVersion(v => v match {
  case "0.11.0" => "com.github.siasia" %% "xsbt-web-plugin" % "0.12.0-0.2.11.1"
  case "0.11.1" => "com.github.siasia" %% "xsbt-web-plugin" % "0.12.0-0.2.11.1"
  case "0.11.2" => "com.github.siasia" %% "xsbt-web-plugin" % "0.12.0-0.2.11.1"
  case "0.11.3" => "com.github.siasia" %% "xsbt-web-plugin" % "0.12.0-0.2.11.1"
  case x if (x.startsWith("0.12")) => "com.github.siasia" %% "xsbt-web-plugin" % "0.12.0-0.2.11.1"
})