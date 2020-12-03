# DutchFirstNames
Analysis of babynames in the Netherlands over the period 1880-2014.

Data is taken from de Voornamenbank from the Meertens Institute in the Netherlands. They publish lists of the  most popular names in a given year (as far back as 1880), as well as the popularity of a given name through time. 

The former is read in with simple scraping of the table. The latter is only published in a histogram, so the read_histograms.py script in this repository reads in the data by downloading the image and analysing it. This is achieved in a few steps:
1. Automated downloading of image
1. Identify the row (column) of the x-axis (y-axis), as rows of zeros in the R-channel
1. Identify ticks on the x-axis as period zeropoints in the row below the x-axis. Times are extracted relative to the ticks.
1. At every time, identify the height (in pixels) of the histogram by continuous segments of zeros, from the x-axis.
1. Currently, the histograms are relative: no y-axis tick extraction is performed. 
These tasks are performed in `read_popularity_lists.py` and `read_histograms.py`

After reading this in, some statistics are calculated and appended to the dataframe: 
1. Characterlength of a given name
1. The average characterlength of babynames in a given year; the average is weighted by a name's popularity
1. Inequality statistics of babynames in a given year. The calculated metrics are the Gini index, the Hoover index, the Palma ratio, the 20-20 ratio, and the Galt score. These are useful because it tells us something about the dominance of the most popular name(s) - see analysis below. 
1. The birth distribution of people with a given name is combined with average survival statistics from the central Dutch bureau of statistics (CBS), to obtain the average age of the people with that name that are still living. See analysis below. 
These tasks are performed by `statistics.py`

The main output data can be found in `name_statistics_netherlands_1880-2014.csv`

Required Python packages:
glob, itertools, matplotlib, numpy, os, pandas, PIL, seaborn, urllib, unidecode

Let's have a look at the dataset. Plots below are all done within `plotting.py`

The zeroth-order thing we can do, is look at the total number of births over time. A small caveat here is that this only tracks the top-100 names in boys and girls (~200 names in total). The percentage of the total births that these reprents is unlikely to be constant over time (in particular, I would expect this to be a smaller percentage in recent years, as we will see later). Adding the total number of births would be a small, straightforward extension of the dataset. 
Most notably, in this figure we see:
1. Rising total births early on, corresponding to a rising population size. 
1. The babyboom after the war is a significant spike in the number of births. 
1. The number of births falls sharply after the 1960s, coinciding with the introduction of advanced anti-conception.
1. At the beginning of the 21st century the birth rates are similar to those at the beginning of the 20th century, but with a much larger population this represents a much lower fertility. 

![Annual births of top-100 male and female names](https://github.com/Josha91/DutchFirstNames/blob/master/images/annual_births.png)

Next, we would like to know what happens to the popularity of specific babynames. Traditionally, the most popular names have been 'Johannes' for boys, and 'Maria' for girls. This was true for a long time, but started to change in the 1950s. This is shown in the black line below. When combined with survival statistics, we can find the colored histogram, which are all the people with those names that are still expected to be alive. If you meet a Johannes or a Maria, odds are they are a bit older. 

![Popularity of 'Johannes' and 'Maria' over time](https://github.com/Josha91/DutchFirstNames/blob/master/images/Johannes_Maria.png)

The contrary is true if we look at Jaydens and Mauds. These names have been rising rapidly in popularity in recent years, with the average Jayden being 9 years old and the average Maud being 15. These statistics are somewhat skewed by the fact that the data only reaches up to 2014 - which is especially relevant for the 'younger' names. 

![Popularity of 'Jayden' and 'Maud' over time](https://github.com/Josha91/DutchFirstNames/blob/master/images/Jayden_Maud.png)

The interesting thing about this, is that for many names you will be able to tell fairly accurately how old they are based only on the first name. As an example: one of my favorite comedians is called Ronald, and in one of his shows he tells us about his childhood crush - Jaqueline. *Both* of these names were very fashionable in the late 60s and early 70s. Indeed, Ronald Goedemondt was born in 1975. 

Let's have a look at the ages of a set of different names, then. Here is a boxplot showing the median and 25th-to-50th percentile of people with a given name. First for the boys:

![Ages of different names](https://github.com/Josha91/DutchFirstNames/blob/master/images/age_distribution_man.png)

'Theodorus' is almost guaranteed to be old; Jayden's are young; and 'Simon' and 'Jack' are more timeless classics. Now for the girls:

![Ages of different names](https://github.com/Josha91/DutchFirstNames/blob/master/images/age_distribution_vrouw.png)

'Theodora' is old, Maud is young, and Sophie's in the timeless classic here. Note the location of 'Ronald' and 'Jacqueline' in these graphs!

Then, we might ask ourselves the question how 'original' parents were with the names they gave their children, throughout history. We can quantify this by looking at the popularity of the top-100 names, and calculating 'inequality' statistics on these - much like people do in economic theory. Instead of income or wealth, the relevant attribute here is the number of babies with a given name. If all babies have only one name, that would be a perfectly inequal situation. Similarly, if the top 100 names all have the same number of babies associated with them, it's perfectly equitable. There are various inequality metrics in use, the ones that are incorporated in the dataset are:
1. The Gini index. Based on the shape of the cumulative wealth distribution. A Gini index of 1 means perfect inequality, 0 means perfect equality.
2. Palma ratio. Ratio between the top-10% and the bottom-40%.
3. Hoover index: the amount of wealth that would need to be re-distributed to achieve equality.
4. Galt score: the ratio between the 'CEO' (most popular name) to the median 'worker' (median name popularity)
5. 20-20 ratio: the ratio between the top-20% and the bottom-20%. 

In practice, many of these show a consistent picture. The Gini index looks like this:

![Gini index of name popularity](https://github.com/Josha91/DutchFirstNames/blob/master/images/Gini.png)

The Gini index used to be much higher early on, and decreased with time. This means that parents used to be conservative in their naming: many babies carried a relatively small number of names. Contrarily, in recent years parents have become more original, and many names are carried by a small number of babies. This picture is very similar in girls and boys, with the girls names being slightly less original early on, but this difference disappears with time. 
If we then look at the Galt score, we see something similar, but the difference in the early 20th century between the genders is more stark. What we are seeing here is that a small number of names dominated in both girls and boys names, but if we look at the most popular names (Johannes and Maria), we see that Maria is even more strikingly popular than Johannes. 

![Galt Score of name popularity](https://github.com/Josha91/DutchFirstNames/blob/master/images/Galt.png)

Finally, we can have a look at the average length of babynames. The figure below shows the average number of characters of babynames in a given year, both weighted (dashed) and unweighted (solid) by that name's popularity, and split for boys and girls. Things to note here:
1. Girls names used to be longer than boys names by about half a character for a long time. This can be understood in part from the fact that many old fashioned girls names were a boys name with a suffic - e.g. 'Geert' became 'Geertje'. Apparently this offset the fact that latin names tend to be *shorter* for women - e.g. Lucius and Lucia. This trend of longer girls names persisted until the turn of the millenium. 
1. The average length of both girls and boys names decreased rapidly after the 1960s, by about 2 characters. Single-syllable names became very popular. 


![Length of babynames](https://github.com/Josha91/DutchFirstNames/blob/master/images/average_name_length.png)

Not shown here, but what I investigated elsewhere, is that these trends are contrary to what is seen in the USA. In particular, name lengths *did not* change much there in the last 100 years, parents were not as 'conservative' at the turn of the 19th century. This can be understood from the larger variety in cultural backgrounds that cohabitated the US at that time.


![Comparison to other countries](https://github.com/Josha91/DutchFirstNames/blob/master/images/name_length_vowels.png)
