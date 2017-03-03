# Square the cricle

This is a CircleCI builds stats function that runs on AWS lambda. It derives build statistics from CircleCI api and sends the report to a slack channel.
At the moment it works only with [website-honestly](https://github.com/redbadger/website-honestly).

## Schedule
The report is scheduled to be sent to `#internal-projects` slack channel *every week on Monday at 9:00 am*.

## Stats
At the moment we derive from CircleCI API the following stats:
* Percentage of failed builds
* Number of code deployments
* Average Build time
